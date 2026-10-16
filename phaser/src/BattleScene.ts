import Phaser from 'phaser';
import { createIronwoodEngine } from '../../src/core/engine.js';
import { HEROES, MISSIONS, SKILLS } from '../../src/core/data.js';

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
  x: number; y: number; base: string; wall: number;
  fire: number; wet: number; ice: number; fog: number; web: number;
  vines: number; thorns: number; charge: number; corrupt: number;
  objective: string; cleared: boolean;
};

export class BattleScene extends Phaser.Scene {
  private engine = createIronwoodEngine({ seed: 20261015 });
  private selected = 'a0';
  private selectedSkill: string | null = null;
  private note = '';

  constructor() { super('Battle'); }

  create(): void {
    this.newCampaign();

    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      this.onBoardPress(pointer.worldX, pointer.worldY);
    });

    document.getElementById('endTurn')?.addEventListener('click', () => {
      if (this.engine.endTurn()) {
        this.selectedSkill = null;
        this.note = '';
      }
      this.renderBattle();
    });

    document.getElementById('restart')?.addEventListener('click', () => {
      this.newCampaign();
    });

    document.getElementById('nextMission')?.addEventListener('click', () => {
      if (this.engine.getOutcome() !== 'victory') return;
      this.engine.advanceMission('hp');
      this.engine.deployMission();
      this.selected = 'a0';
      this.selectedSkill = null;
      this.note = '';
      this.renderBattle();
    });
  }

  private newCampaign(): void {
    this.engine = createIronwoodEngine({ seed: 20261015 });
    this.engine.startCampaign({
      team: ['guardian', 'ranger', 'druid'],
      seed: 20261015,
      difficulty: 'normal',
    });
    this.engine.deployMission();
    this.selected = 'a0';
    this.selectedSkill = null;
    this.note = '';
    this.renderBattle();
  }

  private onBoardPress(worldX: number, worldY: number): void {
    const x = Math.floor(worldX / CELL);
    const y = Math.floor(worldY / CELL);
    if (x < 0 || x >= SIZE || y < 0 || y >= SIZE) return;

    const state = this.engine.snapshot();
    if (state.phase !== 'player') return;

    const clicked = (state.actors as Actor[]).find(a => a.hp > 0 && a.x === x && a.y === y);

    if (this.selectedSkill) {
      const performed = this.engine.useSkill(this.selected, this.selectedSkill, x, y);
      if (performed) this.selectedSkill = null;
    } else if (clicked?.side === 'ally') {
      this.selected = clicked.id;
    } else if (clicked?.side === 'enemy') {
      this.engine.attack(this.selected, clicked.id);
    } else {
      this.engine.move(this.selected, x, y);
    }

    const messageEvents = this.engine.drainEvents().filter((event: any) => event.type === 'message');
    this.note = messageEvents.at(-1)?.message || '';
    this.renderBattle();
  }

  private renderBattle(): void {
    this.children.removeAll(true);
    const state = this.engine.snapshot();
    if (!state?.board) return;

    const selectedActor = (state.actors as Actor[]).find(a => a.id === this.selected);
    const graphics = this.add.graphics();

    // Tilemap placeholder: one mutable tile per core coordinate. An atlas replaces
    // these vector textures in Phase 3, without touching rules or tile state.
    for (const tile of state.board as Tile[]) {
      const left = tile.x * CELL, top = tile.y * CELL;
      graphics.fillStyle(COLORS[tile.base] ?? COLORS.grass, 1);
      graphics.fillRect(left, top, CELL, CELL);

      if (tile.base === 'tree') {
        graphics.fillStyle(0x42664b, .9);
        graphics.fillRect(left + 8, top + 10, 22, 18);
        graphics.fillStyle(0x1c3027, 1);
        graphics.fillRect(left + 16, top + 27, 6, 11);
      } else if (tile.base === 'bush') {
        graphics.fillStyle(0x547558, .6);
        graphics.fillRect(left + 7, top + 22, 26, 8);
      } else if (tile.base === 'water') {
        graphics.fillStyle(0x4b8291, .65);
        graphics.fillRect(left + 5, top + 12, 18, 3);
      } else if (tile.base === 'rock') {
        graphics.fillStyle(0x798079, .7);
        graphics.fillRect(left + 10, top + 12, 21, 13);
      }

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

    if (state.phase === 'player' && selectedActor?.hp > 0 && !this.selectedSkill) {
      graphics.lineStyle(2, 0x7ab995, .75);
      for (const p of this.engine.reachable(selectedActor.id)) {
        graphics.strokeRect(p.x * CELL + 3, p.y * CELL + 3, CELL - 6, CELL - 6);
      }
    }

    for (const actor of state.actors as Actor[]) {
      if (actor.hp <= 0) continue;
      const x = actor.x * CELL + CELL / 2, y = actor.y * CELL + CELL / 2;
      const color = parseInt(actor.color.slice(1), 16);
      graphics.fillStyle(0x11191a, 1);
      graphics.fillCircle(x, y, 17);
      graphics.fillStyle(color, 1);
      graphics.fillCircle(x, y, 14);
      graphics.lineStyle(actor.id === this.selected ? 3 : 2, actor.id === this.selected ? 0xfce0a6 : 0x28312b);
      graphics.strokeCircle(x, y, 16);
      graphics.fillStyle(0x111b1c, 1);
      graphics.fillRect(x - 16, y + 17, 32, 4);
      graphics.fillStyle(actor.side === 'ally' ? 0x8cbd99 : 0xc46f76, 1);
      graphics.fillRect(x - 16, y + 17, Math.max(0, 32 * actor.hp / actor.maxhp), 4);

      this.add.text(x, y - 1, actor.glyph, {
        fontSize: '19px', color: '#121916', fontFamily: 'Georgia, serif',
      }).setOrigin(.5);
    }

    this.drawHud(state, selectedActor);
  }

  private drawHud(state: any, actor?: Actor): void {
    const mission = MISSIONS[state.mission];
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

    const container = document.getElementById('skills');
    if (container) {
      container.replaceChildren();
      for (const key of [...(HEROES[actor?.kind as keyof typeof HEROES]?.skills ?? []), 'interact']) {
        const skill = SKILLS[key as keyof typeof SKILLS];
        if (!skill) continue;
        const button = document.createElement('button');
        button.textContent = `${skill.name} (✦${skill.cost})`;
        button.title = skill.desc;
        button.className = this.selectedSkill === key ? 'active' : '';
        button.disabled = state.phase !== 'player' || !actor || actor.ap <= 0 || actor.mp < skill.cost;
        button.addEventListener('click', () => {
          this.selectedSkill = this.selectedSkill === key ? null : key;
          this.note = this.selectedSkill ? `Selecione alvo para ${skill.name}` : '';
          this.renderBattle();
        });
        container.appendChild(button);
      }
    }

    const endTurn = document.getElementById('endTurn') as HTMLButtonElement | null;
    const nextMission = document.getElementById('nextMission') as HTMLButtonElement | null;
    if (endTurn) endTurn.disabled = state.phase !== 'player';
    if (nextMission) nextMission.hidden = state.phase !== 'between';

    const lines = document.getElementById('battleLog');
    if (lines) {
      lines.replaceChildren();
      for (const entry of (state.logs ?? []).slice(0, 5)) {
        const p = document.createElement('p');
        p.textContent = entry;
        lines.appendChild(p);
      }
    }
  }
}
