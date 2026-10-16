import Phaser from 'phaser';
import { createIronwoodEngine } from '../../src/core/engine.js';
import { HEROES, MISSIONS, SKILLS, UPGRADES } from '../../src/core/data.js';
import { installPixelAtlas } from './PixelAtlas';
import { readPreviewSave, writePreviewSave, exportCampaign, parseImportedSave } from './PreviewSave';

const CELL = 40;
const SIZE = 12;
const COLORS: Record<string, number> = {
  grass: 0x243a2c,
  bush: 0x365344,
  tree: 0x172b21,
  rock: 0x444846,
  water: 0x19394b,
  bones: 0x4c3c36,
};

type Actor = {
  id: string; name: string; kind: string; side: string; glyph: string; color: string;
  x: number; y: number; hp: number; maxhp: number; ap: number; mp: number; maxmp: number;
  root: number; guard: number;
};

type Tile = {
  x: number; y: number; base: string; texture: number; wall: number;
  fire: number; wet: number; ice: number; fog: number; web: number;
  vines: number; thorns: number; charge: number; corrupt: number;
  objective: string; cleared: boolean;
};

type ActorView = {
  container: Phaser.GameObjects.Container;
  frame: Phaser.GameObjects.Graphics;
  sprite: Phaser.GameObjects.Image;
  kind: string;
  x: number; y: number; hp: number;
};

export class BattleScene extends Phaser.Scene {
  private engine = createIronwoodEngine({ seed: 20261015 });
  private selected = 'a0';
  private selectedSkill: string | null = null;
  private note = '';
  private team = ['guardian', 'ranger', 'druid'];
  private active = false;
  private actorViews = new Map<string, ActorView>();
  private actorAllocations = 0;
  private inspectMode = false;
  private terrainSprites: Phaser.GameObjects.Image[] = [];
  private worldOverlay: Phaser.GameObjects.Graphics | null = null;
  private unitsLayer: Phaser.GameObjects.Container | null = null;
  private terrainUpdates = 0;
  private aimLayer: Phaser.GameObjects.Graphics | null = null;
  private aimCell: { x: number; y: number } | null = null;
  private armedSpell: string | null = null;
  // Critical animations fence gameplay commands; inspection and selection stay usable.
  private motionTweens = new Set<Phaser.Tweens.Tween>();
  private ignoredCommands = 0;
  // HUD actions remain mounted as long as the hero/skill layout is the same.
  private skillButtons = new Map<string, HTMLButtonElement>();
  private skillLayout = '';
  private skillBuilds = 0;
  // M3f: skip costly overlay geometry and DOM rebuilds when inputs are unchanged.
  private overlaySignature = '';
  private overlayDraws = 0;
  private battleLogSignature = '';
  private logBuilds = 0;
  private upgradeSignature = '';
  private upgradeBuilds = 0;

  constructor() { super('Battle'); }

  private commandLocked(): boolean { return this.motionTweens.size > 0; }

  private reportAction(message: string, kind: 'info' | 'warning' = 'info'): void {
    const node = document.getElementById('actionFeedback');
    if (node) {
      node.textContent = message;
      node.dataset.kind = kind;
    }
  }

  private explainSkillDenial(reason: string): string {
    switch (reason) {
      case 'blocked-sight': return 'Visão obstruída: há um obstáculo entre a unidade e o alvo.';
      case 'outside-board': return 'A casa escolhida está fora do mapa.';
      case 'invalid-target': return 'Alvo inválido: confira o alcance, os pontos de ação, a mana e o tipo de alvo.';
      case 'unknown-skill': return 'Esta unidade não possui essa habilidade.';
      case 'phase': return 'Aguarde a sua fase para usar uma habilidade.';
      default: return 'Não foi possível executar a habilidade.';
    }
  }

  private syncSkillButtons(state: any, actor?: Actor): void {
    const panel = document.getElementById('skills');
    if (!panel) return;
    const keys = [...(HEROES[actor?.kind as keyof typeof HEROES]?.skills ?? []), 'interact']
      .filter(key => Boolean(SKILLS[key as keyof typeof SKILLS]));
    const layout = keys.join('|');
    if (layout !== this.skillLayout) {
      panel.replaceChildren();
      this.skillButtons.clear();
      for (const key of keys) {
        const skill = SKILLS[key as keyof typeof SKILLS];
        const button = document.createElement('button');
        button.textContent = `${skill.name} (✦${skill.cost})`;
        button.title = skill.desc;
        button.dataset.skill = key;
        button.type = 'button';
        button.addEventListener('click', () => {
          this.inspectMode = false;
          this.armedSpell = null;
          this.aimCell = null;
          this.selectedSkill = this.selectedSkill === key ? null : key;
          this.note = this.selectedSkill ? `Selecione alvo para ${skill.name}` : '';
          this.reportAction(this.selectedSkill
            ? `Habilidade selecionada: ${skill.name}. Escolha uma casa válida.`
            : 'Habilidade cancelada. Selecione uma ação.');
          this.renderBattle();
        });
        this.skillButtons.set(key, button);
        panel.appendChild(button);
      }
      this.skillLayout = layout;
      this.skillBuilds++;
    }
    for (const key of keys) {
      const button = this.skillButtons.get(key)!;
      const skill = SKILLS[key as keyof typeof SKILLS];
      button.classList.toggle('active', this.selectedSkill === key);
      button.setAttribute('aria-pressed', String(this.selectedSkill === key));
      button.disabled = state.phase !== 'player' || !actor || actor.ap <= 0 || actor.mp < skill.cost;
    }
    panel.dataset.builds = String(this.skillBuilds);
    panel.dataset.buttons = String(this.skillButtons.size);
  }


  private showCommandState(): void {
    const board = document.getElementById('game');
    if (board) {
      board.dataset.inputLocked = String(this.commandLocked());
      board.dataset.ignoredCommands = String(this.ignoredCommands);
    }
    const status = document.getElementById('commandStatus');
    if (status) status.textContent = this.commandLocked()
      ? 'ANIMANDO — ações de combate aguardam o fim do movimento ou dano. Inspeção e seleção continuam disponíveis.'
      : 'PRONTO — escolha uma unidade, um movimento ou uma habilidade.';
    const endTurn = document.getElementById('endTurn') as HTMLButtonElement | null;
    if (endTurn && this.active) endTurn.disabled =
      this.engine.snapshot().phase !== 'player' || this.commandLocked();
  }

  private trackCombatTween(tween: Phaser.Tweens.Tween): void {
    this.motionTweens.add(tween);
    const done = () => {
      this.motionTweens.delete(tween);
      this.showCommandState();
    };
    tween.once('complete', done);
    tween.once('stop', done);
    this.showCommandState();
  }


  create(): void {
    const count = installPixelAtlas(this);
    const boardElement = document.getElementById('game');
    if (boardElement) {
      boardElement.dataset.art = 'original-16px-pixel-atlas';
      boardElement.dataset.textures = String(count);
    }
    this.bindLobby();
    this.showLobby();

    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      this.onBoardPress(pointer.worldX, pointer.worldY);
    });
    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (!this.active || !this.selectedSkill) return;
      const x = Math.floor(pointer.worldX / CELL), y = Math.floor(pointer.worldY / CELL);
      if (x < 0 || x >= SIZE || y < 0 || y >= SIZE) return;
      if (this.aimCell?.x === x && this.aimCell?.y === y) return;
      this.aimCell = { x, y };
      this.paintAim();
    });

    document.getElementById('endTurn')?.addEventListener('click', () => {
      if (!this.active || this.commandLocked()) {
        this.showCommandState();
        return;
      }
      if (this.engine.endTurn()) {
        this.selectedSkill = null;
        this.armedSpell = null;
        this.aimCell = null;
        this.note = '';
      }
      this.persist();
      this.renderBattle();
    });

    document.getElementById('inspectMode')?.addEventListener('click', () => {
      if (!this.active) return;
      this.inspectMode = !this.inspectMode;
      if (this.inspectMode) this.selectedSkill = null;
      this.renderBattle();
    });
    document.getElementById('restart')?.addEventListener('click', () => this.showLobby());
    document.getElementById('saveCampaign')?.addEventListener('click', () => this.persist());
    document.getElementById('exportCampaign')?.addEventListener('click', () => {
      if (!this.active) return;
      try { exportCampaign(this.engine.snapshot()); this.setSaveStatus('Campanha exportada em JSON.'); }
      catch { this.setSaveStatus('Não foi possível exportar a campanha.'); }
    });
    this.input.keyboard?.on('keydown-I', () => {
      if (!this.active || this.engine.snapshot()?.phase !== 'player') return;
      this.inspectMode = !this.inspectMode;
      if (this.inspectMode) this.selectedSkill = null;
      this.renderBattle();
    });
    this.input.keyboard?.on('keydown-ESC', () => {
      this.selectedSkill = null;
      this.inspectMode = false;
      this.armedSpell = null;
      this.aimCell = null;
      this.note = '';
      if (this.active) this.renderBattle();
    });
  }

  private setSaveStatus(message: string): void {
    const target = document.getElementById('saveStatus');
    if (target) target.textContent = message;
  }

  private persist(): void {
    if (!this.active) return;
    try {
      const ok = writePreviewSave(this.engine.snapshot());
      this.setSaveStatus(ok ? 'Progresso salvo neste navegador.' : 'Armazenamento indisponível. Exporte o JSON.');
    } catch {
      this.setSaveStatus('Falha ao validar o salvamento. Exporte para diagnóstico.');
    }
  }

  private bindLobby(): void {
    const container = document.getElementById('heroSelection');
    if (container) {
      for (const [key, hero] of Object.entries(HEROES)) {
        const button = document.createElement('button');
        button.className = 'heroChoice';
        button.dataset.hero = key;
        const title = document.createElement('strong');
        title.textContent = hero.name;
        const role = document.createElement('small');
        role.textContent = hero.role;
        const stats = document.createElement('small');
        stats.textContent = `PV ${hero.hp} · Mana ${hero.mp}`;
        button.append(title, role, stats);
        button.addEventListener('click', () => {
          if (this.team.includes(key)) this.team = this.team.filter(id => id !== key);
          else if (this.team.length < 3) this.team.push(key);
          else { this.setLobbyError('Escolha exatamente três combatentes.'); return; }
          this.setLobbyError('');
          this.renderTeamSelection();
        });
        container.appendChild(button);
      }
    }
    document.getElementById('startCampaign')?.addEventListener('click', () => {
      if (this.team.length !== 3) return;
      const difficulty = (document.getElementById('difficulty') as HTMLSelectElement).value;
      this.newCampaign([...this.team], difficulty);
    });
    document.getElementById('continueCampaign')?.addEventListener('click', () => {
      const value = readPreviewSave();
      if (value) this.resumeCampaign(value);
      else this.setLobbyError('Não há um save válido neste navegador.');
    });
    document.getElementById('importCampaign')?.addEventListener('click', () => {
      (document.getElementById('importFile') as HTMLInputElement)?.click();
    });
    document.getElementById('importFile')?.addEventListener('change', async () => {
      const input = document.getElementById('importFile') as HTMLInputElement;
      const file = input.files?.[0];
      if (!file) return;
      try {
        const value = await parseImportedSave(file);
        this.resumeCampaign(value);
      } catch (error) {
        this.setLobbyError(error instanceof Error ? error.message : 'Save inválido.');
      } finally { input.value = ''; }
    });
  }

  private setLobbyError(message: string): void {
    const target = document.getElementById('lobbyError');
    if (target) target.textContent = message;
  }

  private renderTeamSelection(): void {
    document.querySelectorAll<HTMLButtonElement>('.heroChoice').forEach(button => {
      const chosen = this.team.includes(button.dataset.hero || '');
      button.setAttribute('aria-pressed', String(chosen));
    });
    const count = document.getElementById('teamCount');
    if (count) count.textContent = `${this.team.length}/3`;
    const start = document.getElementById('startCampaign') as HTMLButtonElement;
    if (start) start.disabled = this.team.length !== 3;
  }

  private showLobby(): void {
    this.active = false;
    this.reportAction('Menu de campanha. Selecione sua companhia.');
    for (const tween of this.motionTweens) tween.stop();
    this.motionTweens.clear();
    this.showCommandState();
    this.selectedSkill = null;
    this.inspectMode = false;
    this.armedSpell = null;
    this.aimCell = null;
    this.renderTeamSelection();
    this.setLobbyError('');
    const resume = document.getElementById('continueCampaign') as HTMLButtonElement;
    if (resume) resume.disabled = !readPreviewSave();
    const lobby = document.getElementById('lobby');
    if (lobby) lobby.hidden = false;
  }

  private hideLobby(): void {
    const lobby = document.getElementById('lobby');
    if (lobby) lobby.hidden = true;
  }

  private resumeCampaign(value: any): void {
    const candidate = createIronwoodEngine({ seed: value.seed });
    // Validate before replacing the running engine, preserving the active game on error.
    candidate.restoreSave(value);
    if (['ready', 'brief', 'defeat'].includes(candidate.snapshot().phase)) {
      candidate.deployMission();
    }
    this.engine = candidate;
    this.resetActorViews();
    this.active = true;
    this.ignoredCommands = 0;
    this.selected = candidate.snapshot().selected || 'a0';
    this.selectedSkill = null;
    this.inspectMode = false;
    this.armedSpell = null;
    this.aimCell = null;
    this.note = '';
    this.hideLobby();
    this.persist();
    this.renderBattle();
  }

  private newCampaign(team: string[], difficulty: string): void {
    const seed = Date.now() >>> 0;
    this.engine = createIronwoodEngine({ seed });
    this.engine.startCampaign({ team, difficulty, seed });
    this.engine.deployMission();
    this.resetActorViews();
    this.active = true;
    this.ignoredCommands = 0;
    this.selected = 'a0';
    this.selectedSkill = null;
    this.note = '';
    this.hideLobby();
    this.persist();
    this.renderBattle();
  }

  private onBoardPress(worldX: number, worldY: number): void {
    if (!this.active) return;
    const x = Math.floor(worldX / CELL);
    const y = Math.floor(worldY / CELL);
    if (x < 0 || x >= SIZE || y < 0 || y >= SIZE) return;

    const state = this.engine.snapshot();
    if (state.phase !== 'player') return;

    if (this.inspectMode) {
      this.inspectTile(x, y, state);
      return;
    }
    const clicked = (state.actors as Actor[]).find(a => a.hp > 0 && a.x === x && a.y === y);
    if (this.commandLocked()) {
      if (!this.selectedSkill && clicked?.side === 'ally') {
        // Read-only ally selection never interrupts a movement tween.
        this.selected = clicked.id;
        this.renderBattle();
      } else {
        // Never queue a stale target after enemy AI has possibly moved units.
        // Explicitly reject mutating commands; no AP, mana, save or RNG changes.
        this.ignoredCommands++;
        this.reportAction('ANIMANDO: comando de combate ignorado, sem gastar PA ou mana.', 'warning');
        this.showCommandState();
      }
      return;
    }

    let performed = false;
    if (this.selectedSkill) {
      const skillId = this.selectedSkill;
      const preview = this.engine.previewImpact(this.selected, skillId, x, y);
      this.aimCell = { x, y };
      if (!preview.allowed) {
        this.armedSpell = null;
        this.reportAction(this.explainSkillDenial(preview.reason), 'warning');
        this.paintAim();
        return;
      }
      if (preview.confirm && this.armedSpell !== `${skillId}:${x},${y}`) {
        this.armedSpell = `${skillId}:${x},${y}`;
        this.reportAction('Área exibida. Toque novamente na mesma casa para confirmar sem atingir aliados por engano.', 'warning');
        this.paintAim();
        return;
      }
      performed = this.engine.useSkill(this.selected, skillId, x, y);
      if (performed) {
        this.selectedSkill = null;
        this.reportAction(`${SKILLS[skillId as keyof typeof SKILLS]?.name ?? 'Habilidade'} executada.`);
      } else this.reportAction('A habilidade não pôde ser executada. Confira o log.', 'warning');
      this.armedSpell = null;
    } else if (clicked?.side === 'ally') {
      this.selected = clicked.id;
      this.reportAction(`${clicked.name} selecionado(a). Selecione uma ação.`);
      this.renderBattle();
      return;
    } else if (clicked?.side === 'enemy') {
      performed = this.engine.attack(this.selected, clicked.id);
      this.reportAction(performed ? `Ataque realizado contra ${clicked.name}.` :
        'Ataque indisponível: verifique PA, distância e cobertura.', performed ? 'info' : 'warning');
    } else {
      performed = this.engine.move(this.selected, x, y);
      this.reportAction(performed ? 'Movimento executado.' :
        'Movimento indisponível: verifique PA, alcance, terreno e ocupação da casa.',
        performed ? 'info' : 'warning');
    }

    const messageEvents = this.engine.drainEvents().filter((event: any) => event.type === 'message');
    this.note = messageEvents.at(-1)?.message || '';
    // Invalid actions and ally selection never rewrite saves.
    if (performed) this.persist();
    this.renderBattle();
  }

  private paintAim(): void {
    const overlay = this.aimLayer;
    if (!overlay) return;
    overlay.clear();
    const report = document.getElementById('impactInfo');
    const game = document.getElementById('game');
    if (!this.active || !this.selectedSkill || !this.aimCell) {
      if (game) game.dataset.impactTiles = '0';
      if (report) report.textContent = 'Passe o cursor sobre uma casa ou toque para pré-visualizar magias de área.';
      return;
    }
    const p = this.engine.previewImpact(this.selected, this.selectedSkill, this.aimCell.x, this.aimCell.y);
    if (!p.allowed) {
      if (game) game.dataset.impactTiles = '0';
      if (report) report.textContent = 'Alvo indisponível: fora de alcance, bloqueado ou sem recursos. Nenhum recurso foi gasto.';
      return;
    }
    const state = this.engine.snapshot();
    const risk = new Set<string>(p.allyIds);
    for (const tile of p.tiles) {
      const alliesHere = (state.actors as Actor[]).some(u =>
        u.hp > 0 && risk.has(u.id) && u.x === tile.x && u.y === tile.y);
      const tint = alliesHere ? 0xf16a64 : 0xd8a95c;
      overlay.fillStyle(tint, alliesHere ? .35 : .17);
      overlay.fillRect(tile.x * CELL + 2, tile.y * CELL + 2, CELL - 4, CELL - 4);
      overlay.lineStyle(alliesHere ? 3 : 2, tint, .9);
      overlay.strokeRect(tile.x * CELL + 2, tile.y * CELL + 2, CELL - 4, CELL - 4);
    }
    if (game) game.dataset.impactTiles = String(p.tiles.length);
    const armed = this.armedSpell === `${this.selectedSkill}:${this.aimCell.x},${this.aimCell.y}`;
    const info = `Área inicial: ${p.tiles.length} casa(s).` +
      (risk.size ? ` ALERTA: ${risk.size} aliado(s) sujeito(s) ao efeito.` : '') +
      (p.note ? ` ${p.note}` : '') +
      (p.confirm ? armed ? ' TOQUE NOVAMENTE NA MESMA CASA PARA CONFIRMAR.' :
        ' Primeiro toque pré-visualiza; segundo toque confirma.' : ' Um toque executa.');
    if (report) report.textContent = info;
  }

  private inspectTile(x: number, y: number, state: any): void {
    const tile = (state.board as Tile[])[y * SIZE + x];
    const actor = (state.actors as Actor[]).find(u => u.hp > 0 && u.x === x && u.y === y);
    const names: Record<string, string> = {
      grass: 'Clareira', tree: 'Árvore', bush: 'Arbustos',
      water: 'Água', rock: 'Rochas', bones: 'Ruínas e ossos',
    };
    const conditions = (['fire', 'ice', 'wet', 'fog', 'web', 'vines',
      'thorns', 'charge', 'corrupt', 'wall'] as const)
      .filter(key => Number(tile[key] || 0) > 0)
      .map(key => `${key}: ${tile[key]}`);
    const objective = tile.objective && !tile.cleared
      ? ` · Objetivo: ${tile.objective}` : '';
    const unit = actor
      ? ` · ${actor.name} (${actor.side === 'ally' ? 'aliado' : 'inimigo'}), PV ${actor.hp}/${actor.maxhp}` : '';
    const text = `Casa ${x + 1},${y + 1}: ${names[tile.base] || tile.base}${objective}${unit}. ${conditions.length ? conditions.join(' · ') : 'Sem efeitos ambientais.'}`;
    const node = document.getElementById('tileInfo');
    if (node) node.textContent = text;
  }

  // Reset only on a different campaign or mission. In a normal render the
  // existing sprite and container retain their identity and running tweens.
  private resetActorViews(): void {
    for (const tween of this.motionTweens) tween.stop();
    this.motionTweens.clear();
    for (const view of this.actorViews.values()) {
      this.tweens.killTweensOf(view.container);
      view.container.destroy();
    }
    this.actorViews.clear();
    // Invalidate all visual calculations when replacing a campaign or mission.
    this.overlaySignature = '';
    this.battleLogSignature = '';
    this.upgradeSignature = '';
    const game = document.getElementById('game');
    if (game) game.dataset.unitObjects = '0';
    this.showCommandState();
  }

  private renderBattle(): void {
    const state = this.engine.snapshot();
    if (!state?.board) return;

    const selectedActor = (state.actors as Actor[]).find(a => a.id === this.selected);

    // Terrain sprites are persistent. Only changed textures are updated.
    // Status overlays and units have independent redraw lifecycles.
    if (this.terrainSprites.length === 0) {
      for (const tile of state.board as Tile[]) {
        const image = this.add.image(tile.x * CELL + CELL / 2, tile.y * CELL + CELL / 2,
          'ironwood-ground-grass-0').setDisplaySize(CELL, CELL);
        this.terrainSprites.push(image);
      }
      this.worldOverlay = this.add.graphics();
      this.unitsLayer = this.add.container(0, 0);
      this.aimLayer = this.add.graphics();
      const game = document.getElementById('game');
      if (game) game.dataset.terrainObjects = String(this.terrainSprites.length);
    }
    for (const tile of state.board as Tile[]) {
      const variant = ((tile.texture || 0) % 4 + 4) % 4;
      const kind = Object.hasOwn(COLORS, tile.base) ? tile.base : 'grass';
      const key = `ironwood-ground-${kind}-${variant}`;
      const image = this.terrainSprites[tile.y * SIZE + tile.x];
      if (image.texture.key !== key) {
        image.setTexture(key);
        this.terrainUpdates++;
      }
    }
    const game = document.getElementById('game');
    if (game) game.dataset.terrainUpdates = String(this.terrainUpdates);
    // Changes to layout, weather, terrain, unit/AP/mana/status or aim validity
    // invalidate this cache. Inspection and other HUD-only work do not.
    const visualSignature = JSON.stringify([
      state.mission, state.round, state.phase, state.weather,
      state.board, state.actors, this.selected, this.selectedSkill,
    ]);
    if (visualSignature !== this.overlaySignature) {
      this.overlaySignature = visualSignature;
      this.overlayDraws++;
      const graphics = this.worldOverlay!;
      graphics.clear();
      // Unit containers persist. Only disappeared actors are removed after sync.
      for (const tile of state.board as Tile[]) {
        const left = tile.x * CELL, top = tile.y * CELL;
        if (tile.web > 0) {
          graphics.lineStyle(2, 0xb7b5a8, .7);
          graphics.lineBetween(left + 4, top + 4, left + 36, top + 36);
          graphics.lineBetween(left + 36, top + 4, left + 4, top + 36);
        }
        if (tile.ice > 0) { graphics.fillStyle(0x99d6e2, .35); graphics.fillRect(left, top, CELL, CELL); }
        if (tile.corrupt > 0) { graphics.fillStyle(0x79365e, .37); graphics.fillRect(left, top, CELL, CELL); }
        if (tile.fire > 0) {
          graphics.fillStyle(0xee782c, .9);
          graphics.fillRect(left + 13, top + 20, 8, 14);
          graphics.fillStyle(0xf9cc75, .9);
          graphics.fillRect(left + 17, top + 15, 7, 10);
        }
        if (tile.charge > 0) {
          graphics.lineStyle(3, 0xb6dbec);
          graphics.lineBetween(left + 5, top + 32, left + 18, top + 14);
          graphics.lineBetween(left + 18, top + 14, left + 30, top + 20);
        }
        if (tile.objective && !tile.cleared) {
          graphics.lineStyle(2, 0xd5b16d, .95);
          graphics.strokeRect(left + 6, top + 6, CELL - 12, CELL - 12);
        }
        if (tile.fog > 0) { graphics.fillStyle(0xa2b3b5, .3); graphics.fillRect(left, top, CELL, CELL); }
        graphics.lineStyle(1, 0x060f10, .32);
        graphics.strokeRect(left, top, CELL, CELL);
      }

      if (state.phase === 'player' && selectedActor?.hp > 0) {
        if (!this.selectedSkill) {
          graphics.lineStyle(2, 0x7ab995, .75);
          for (const p of this.engine.reachable(selectedActor.id)) {
            graphics.strokeRect(p.x * CELL + 3, p.y * CELL + 3, CELL - 6, CELL - 6);
          }
        } else {
          // Shared headless engine gate is authoritative for mana, target and LOS.
          const skill = SKILLS[this.selectedSkill as keyof typeof SKILLS];
          if (skill) for (const tile of state.board as Tile[]) {
            const preview = this.engine.previewSkill(selectedActor.id, this.selectedSkill, tile.x, tile.y);
            if (!preview.allowed) continue;
            const hue = skill.target === 'enemy' ? 0xd17681 :
              this.selectedSkill === 'interact' ? 0xd9ba6e : 0x8cb8c8;
            graphics.lineStyle(2, hue, .9);
            graphics.strokeRect(tile.x * CELL + 4, tile.y * CELL + 4, CELL - 8, CELL - 8);
            graphics.fillStyle(hue, .07);
            graphics.fillRect(tile.x * CELL + 4, tile.y * CELL + 4, CELL - 8, CELL - 8);
          }
        }
      }
    }
    if (game) game.dataset.overlayDraws = String(this.overlayDraws);

    const liveIds = new Set<string>();
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    for (const actor of state.actors as Actor[]) {
      if (actor.hp <= 0) continue;
      liveIds.add(actor.id);
      const x = actor.x * CELL + CELL / 2, y = actor.y * CELL + CELL / 2;
      const spriteKey = `ironwood-unit-${actor.kind}`;
      let view = this.actorViews.get(actor.id);
      if (!view) {
        const frame = this.add.graphics();
        const sprite = this.add.image(0, -2, spriteKey).setDisplaySize(36, 36);
        const container = this.add.container(x, y, [frame, sprite]);
        this.unitsLayer!.add(container);
        view = { frame, sprite, container, kind: actor.kind, x: actor.x, y: actor.y, hp: actor.hp };
        this.actorViews.set(actor.id, view);
        this.actorAllocations++;
      }
      if (view.kind !== actor.kind) {
        view.sprite.setTexture(spriteKey);
        view.kind = actor.kind;
      }
      const frame = view.frame;
      frame.clear();
      frame.fillStyle(actor.side === 'ally' ? 0x1b4235 : 0x542a39, .9);
      frame.fillRect(-19, -19, 38, 38);
      frame.lineStyle(actor.id === this.selected ? 3 : 1,
        actor.id === this.selected ? 0xfce0a6 : actor.side === 'ally' ? 0x71977b : 0xae6d72);
      frame.strokeRect(-19, -19, 38, 38);
      frame.fillStyle(0x101a1b, 1);
      frame.fillRect(-18, 16, 36, 5);
      frame.fillStyle(actor.side === 'ally' ? 0x8cbd99 : 0xc46f76, 1);
      frame.fillRect(-18, 16, Math.max(0, 36 * actor.hp / Math.max(1, actor.maxhp)), 5);
      if (view.x !== actor.x || view.y !== actor.y) {
        this.tweens.killTweensOf(view.container);
        if (reduceMotion) view.container.setPosition(x, y);
        else this.trackCombatTween(this.tweens.add({
          targets: view.container, x, y, duration: 300, ease: 'Sine.easeOut',
        }));
      }
      if (view.hp > actor.hp && !reduceMotion) {
        // Keep the very same container alive for the damage tween.
        this.trackCombatTween(this.tweens.add({
          targets: view.container, alpha: .42, duration: 85, yoyo: true, repeat: 2,
        }));
      }
      view.x = actor.x;
      view.y = actor.y;
      view.hp = actor.hp;
    }
    for (const [id, view] of this.actorViews) {
      if (liveIds.has(id)) continue;
      this.tweens.killTweensOf(view.container);
      view.container.destroy();
      this.actorViews.delete(id);
    }
    const unitCounter = document.getElementById('game');
    if (unitCounter) {
      unitCounter.dataset.unitObjects = String(this.actorViews.size);
      unitCounter.dataset.unitAllocations = String(this.actorAllocations);
    }
    const stats = document.getElementById('renderStats');
    if (stats) stats.textContent = `Renderizador M3c: ${this.terrainSprites.length} tiles fixos · ${this.actorViews.size} personagens visíveis · ${this.actorAllocations} contêineres criados nesta sessão. Inspecionar e mover não devem aumentar esse último número.`;

    this.drawHud(state, selectedActor);
    this.paintAim();
    this.showCommandState();
    const performance = document.getElementById('overlayStats');
    if (performance) performance.textContent =
      `M3f: ${this.overlayDraws} redesenhos de efeitos/alcance · ${this.logBuilds} reconstruções do registro de combate · ${this.upgradeBuilds} construções do menu de melhorias. Inspecionar sem alterar o mundo não aumenta esses contadores.`;
  }

  private drawHud(state: any, actor?: Actor): void {
    const mission = MISSIONS[state.mission] || MISSIONS[MISSIONS.length - 1];
    const phase = state.phase === 'player' ? 'SEU TURNO' :
      state.phase === 'between' ? 'VITÓRIA' : state.phase === 'defeat' ? 'DERROTA' : state.phase;
    const setText = (id: string, text: string) => {
      const el = document.getElementById(id);
      if (el) el.textContent = text;
    };

    setText('missionTitle', mission.title);
    setText('missionDesc', mission.desc);
    setText('phaseStatus', `Rodada ${state.round} · ${phase} · ${state.weather || 'tempo estável'}${this.note ? ' · ' + this.note : ''}`);
    setText('unitName', actor?.name || 'Sem combatente selecionado');
    setText('unitStats', actor
      ? `PV ${actor.hp}/${actor.maxhp} · Mana ${actor.mp}/${actor.maxmp} · PA ${actor.ap}/2${actor.root ? ' · ENRAIZADO' : ''}`
      : '');

    const selectedSpell = this.selectedSkill ? SKILLS[this.selectedSkill as keyof typeof SKILLS] : null;
    setText('skillHelp', selectedSpell
      ? `${selectedSpell.name} · Alcance ${selectedSpell.range} · Mana ${selectedSpell.cost}. ${selectedSpell.desc} Casas destacadas estão válidas segundo as regras de alvo e visão do motor.`
      : 'Casas verdes: movimento. Magias destacam apenas alvos atualmente válidos pelo motor.');

    this.syncSkillButtons(state, actor);

    const inspectButton = document.getElementById('inspectMode') as HTMLButtonElement | null;
    if (inspectButton) {
      inspectButton.disabled = !this.active || state.phase !== 'player';
      inspectButton.setAttribute('aria-pressed', String(this.inspectMode));
      inspectButton.textContent = this.inspectMode ? 'SAIR DA INSPEÇÃO' : 'INSPECIONAR CASA / UNIDADE';
    }
    const endTurn = document.getElementById('endTurn') as HTMLButtonElement | null;
    const nextMission = document.getElementById('nextMission') as HTMLButtonElement | null;
    if (endTurn) endTurn.disabled = state.phase !== 'player' || this.commandLocked();
    if (nextMission) nextMission.hidden = true;
    const upgrades = document.getElementById('upgradeOptions');
    if (upgrades) {
      upgrades.hidden = state.phase !== 'between';
      if (state.phase === 'between') {
        const indices = [(state.mission * 2) % UPGRADES.length,
          (state.mission * 2 + 3) % UPGRADES.length,
          (state.mission * 2 + 5) % UPGRADES.length];
        const upgradeSignature = `${state.mission}:${indices.join(',')}`;
        if (upgradeSignature !== this.upgradeSignature) {
          this.upgradeSignature = upgradeSignature;
          this.upgradeBuilds++;
          upgrades.replaceChildren();
          for (const index of indices) {
            const upgrade = UPGRADES[index];
            const button = document.createElement('button');
            button.textContent = `${upgrade.name} — ${upgrade.desc}`;
            button.addEventListener('click', () => {
              this.engine.advanceMission(upgrade.id);
              this.engine.deployMission();
              this.resetActorViews();
              this.selected = 'a0';
              this.selectedSkill = null;
              this.note = '';
              this.persist();
              this.renderBattle();
            });
            upgrades.appendChild(button);
          }
        }
      }
      upgrades.dataset.builds = String(this.upgradeBuilds);
    }

    const lines = document.getElementById('battleLog');
    if (lines) {
      const recent = (state.logs ?? []).slice(0, 5);
      const signature = JSON.stringify(recent);
      if (signature !== this.battleLogSignature) {
        this.battleLogSignature = signature;
        this.logBuilds++;
        lines.replaceChildren();
        for (const entry of recent) {
          const p = document.createElement('p');
          p.textContent = entry;
          lines.appendChild(p);
        }
      }
      lines.dataset.builds = String(this.logBuilds);
    }
  }
}
