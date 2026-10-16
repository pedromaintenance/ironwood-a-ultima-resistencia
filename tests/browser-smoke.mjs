import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { mkdir, copyFile, writeFile } from 'node:fs/promises';

const outputDir = 'artifacts/baseline';
await mkdir(outputDir, { recursive: true });
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 1,
  isMobile: true,
  hasTouch: true,
  acceptDownloads: true,
  serviceWorkers: 'allow',
});
const page = await context.newPage();
const errors = [];
page.on('pageerror', e => errors.push(e.message));

try {
  await page.goto(process.env.TEST_BASE_URL || 'http://127.0.0.1:8765/', { waitUntil: 'domcontentloaded' });
  await page.locator('#newGame').waitFor();
  await page.screenshot({ path: `${outputDir}/01-menu-mobile.png`, fullPage: true });
  await page.locator('#newGame').click();
  await page.locator('#startMission').waitFor();
  assert.equal(await page.locator('#teamCount').innerText(), '3/3 selecionados');
  await page.screenshot({ path: `${outputDir}/02-equipe-mobile.png`, fullPage: true });
  await page.locator('#startMission').click();
  assert.match(await page.locator('#briefTitle').innerText(), /A Trilha Fechada/);
  await page.locator('#launchBtn').click();
  await page.locator('#field').waitFor({ state: 'visible' });
  const before = await page.evaluate(() => ({ pos: { x: G.actors[0].x, y: G.actors[0].y }, ap: G.actors[0].ap, board: G.board.length }));
  assert.deepEqual(before, { pos: { x: 2, y: 10 }, ap: 2, board: 144 });
  await page.screenshot({ path: `${outputDir}/03-batalha-mobile.png`, fullPage: true });

  const field = page.locator('#field');
  await field.scrollIntoViewIfNeeded();
  const box = await field.boundingBox();
  assert.ok(box);
  await page.touchscreen.tap(box.x + box.width * (3.5/12), box.y + box.height * (10.5/12));
  const afterMove = await page.evaluate(() => ({ x: G.actors[0].x, y: G.actors[0].y, ap: G.actors[0].ap }));
  assert.deepEqual(afterMove, { x: 3, y: 10, ap: 1 });

  await page.locator('#endTurn').click();
  await page.waitForFunction(() => G.round >= 2 || G.phase === 'defeat', { timeout: 12000 });
  assert.equal(await page.evaluate(() => G.round), 2);
  await page.screenshot({ path: `${outputDir}/04-rodada-2-mobile.png`, fullPage: true });

  await page.locator('#battleMenu').click();
  await page.locator('#goMenu').click();
  const downloadPromise = page.waitForEvent('download');
  await page.locator('#exportBtn').click();
  const download = await downloadPromise;
  assert.equal(download.suggestedFilename(), 'ironwood-save.json');
  await copyFile(await download.path(), `${outputDir}/save-v1-teste.json`);
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('ironwood_campaign_v1')));
  assert.equal(saved.ver, 1);
  assert.equal(saved.mission, 0);
  assert.equal(saved.board.length, 144);
  await page.locator('#continue').click();
  await page.waitForFunction(() => G?.phase === 'player');
  await page.evaluate(() => {
    G.actors.filter(a => a.side === 'enemy').forEach(a => { a.hp = 0; });
    updateObjectives(); // intentional forced-victory smoke test, not proof of combat balance
  });
  assert.equal(await page.locator('#between').evaluate(el => !el.classList.contains('hidden')), true);
  await page.screenshot({ path: `${outputDir}/05-resultado-forcado.png`, fullPage: true });

  await page.waitForFunction(() => navigator.serviceWorker?.controller && document.querySelector('#offlineStatus')?.textContent?.includes('PRONTO'), { timeout: 20000 });
  await context.setOffline(true);
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.locator('#newGame').waitFor({ timeout: 10000 });
  await page.screenshot({ path: `${outputDir}/06-offline-mobile.png`, fullPage: true });

  assert.deepEqual(errors, []);
  await writeFile(`${outputDir}/RESULTADO.txt`, 'PASS: menu, equipe, missao 1, movimento, turno, save exportado, vitoria forçada, offline no Chromium mobile emulado. A batalha completa e teste em dispositivo real continuam pendentes.\n');
  console.log('PASS: browser smoke + screenshots + save de teste + offline emulado');
} finally {
  await browser.close();
}
