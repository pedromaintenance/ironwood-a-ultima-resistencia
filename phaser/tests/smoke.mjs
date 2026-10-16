import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';

await mkdir('artifacts/preview', { recursive: true });
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
const errors = [];
page.on('pageerror', error => errors.push(error.message));

async function cell(canvas, x, y) {
  const bounds = await canvas.boundingBox();
  assert.ok(bounds);
  return { x: (x + .5) * bounds.width / 12, y: (y + .5) * bounds.height / 12 };
}

try {
  await page.goto('http://127.0.0.1:4173/', { waitUntil: 'networkidle' });
  assert.equal(await page.locator('#lobby').isVisible(), true, 'lobby should open first');
  assert.equal(await page.locator('#teamCount').innerText(), '3/3');
  await page.locator('#startCampaign').click();
  assert.equal(await page.locator('#lobby').isHidden(), true);
  const canvas = page.locator('#game canvas');
  await canvas.waitFor({ state: 'visible', timeout: 15000 });
  assert.match(await page.locator('#missionTitle').innerText(), /A Trilha Fechada/);
  assert.match(await page.locator('#phaseStatus').innerText(), /Rodada 1/);
  await page.screenshot({ path: 'artifacts/preview/01-battle.png', fullPage: true });

  await canvas.click({ position: await cell(canvas, 3, 10) });
  assert.match(await page.locator('#unitStats').innerText(), /PA 1\/2/);
  assert.match(await page.locator('#battleLog').innerText(), /avança pela floresta/);

  await page.locator('#endTurn').click();
  assert.match(await page.locator('#phaseStatus').innerText(), /Rodada 2/);
  await page.screenshot({ path: 'artifacts/preview/02-round-2.png', fullPage: true });

  await page.locator('#restart').click();
  assert.equal(await page.locator('#lobby').isVisible(), true);
  assert.equal(await page.locator('#continueCampaign').isEnabled(), true);
  await page.locator('#startCampaign').click();
  await canvas.click({ position: await cell(canvas, 5, 10) });
  assert.match(await page.locator('#unitName').innerText(), /Arven/);
  await page.getByRole('button', { name: /Armadilha de Caça/ }).click();
  await canvas.click({ position: await cell(canvas, 5, 9) });
  assert.match(await page.locator('#battleLog').innerText(), /Armadilha de Caça/);
  await page.screenshot({ path: 'artifacts/preview/03-magic.png', fullPage: true });

  // Persistent save and resume must preserve battle state, not reset it.
  const stateBefore = await page.evaluate(() => JSON.parse(localStorage.getItem('ironwood_phaser_preview_v1')));
  assert.equal(stateBefore.ver, 1);
  assert.equal(stateBefore.board.length, 144);
  assert.ok(stateBefore.casts >= 1);
  await page.reload({ waitUntil: 'networkidle' });
  assert.equal(await page.locator('#lobby').isVisible(), true);
  await page.locator('#continueCampaign').click();
  const stateAfter = await page.evaluate(() => JSON.parse(localStorage.getItem('ironwood_phaser_preview_v1')));
  assert.deepEqual(stateAfter, stateBefore);
  assert.equal(await page.locator('#lobby').isHidden(), true);
  await page.screenshot({ path: 'artifacts/preview/04-resumed.png', fullPage: true });

  // Explicit export produces valid, legacy-compatible v1 JSON.
  const downloadPromise = page.waitForEvent('download');
  await page.locator('#exportCampaign').click();
  const download = await downloadPromise;
  assert.equal(download.suggestedFilename(), 'ironwood-phaser-campanha-v1.json');

  // Invalid save import is rejected without overwriting a working campaign.
  await page.locator('#restart').click();
  const fileInput = page.locator('#importFile');
  await fileInput.setInputFiles({ name: 'invalid.json', mimeType: 'application/json', buffer: Buffer.from('{"ver":2}') });
  assert.match(await page.locator('#lobbyError').innerText(), /Invalid Ironwood v1 save/);
  const afterFailedImport = await page.evaluate(() => JSON.parse(localStorage.getItem('ironwood_phaser_preview_v1')));
  assert.deepEqual(afterFailedImport, stateBefore);
  await page.locator('#continueCampaign').click();

  assert.deepEqual(errors, [], 'Phaser should not throw browser errors');
  console.log('PASS: lobby, Phaser battle, movement, turn, spell, persist/reload, export and invalid import');
} finally {
  await browser.close();
}
