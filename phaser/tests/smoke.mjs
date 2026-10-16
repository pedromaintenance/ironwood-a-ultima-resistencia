import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';

await mkdir('artifacts/preview', { recursive: true });
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
const errors = [];
page.on('pageerror', error => errors.push(error.message));

function cell(x, y) {
  return { x: (x + .5) * 480 / 12, y: (y + .5) * 480 / 12 };
}

try {
  await page.goto('http://127.0.0.1:4173/', { waitUntil: 'networkidle' });
  const canvas = page.locator('#game canvas');
  await canvas.waitFor({ state: 'visible', timeout: 15000 });
  assert.match(await page.locator('#missionTitle').innerText(), /A Trilha Fechada/);
  assert.match(await page.locator('#phaseStatus').innerText(), /Rodada 1/);
  await page.screenshot({ path: 'artifacts/preview/01-battle.png', fullPage: true });

  await canvas.click({ position: cell(3, 10) });
  assert.match(await page.locator('#unitStats').innerText(), /PA 1\/2/);
  assert.match(await page.locator('#battleLog').innerText(), /avança pela floresta/);

  await page.locator('#endTurn').click();
  assert.match(await page.locator('#phaseStatus').innerText(), /Rodada 2/);
  await page.screenshot({ path: 'artifacts/preview/02-round-2.png', fullPage: true });

  await page.locator('#restart').click();
  await canvas.click({ position: cell(5, 10) });
  assert.match(await page.locator('#unitName').innerText(), /Arven/);
  await page.getByRole('button', { name: /Armadilha de Caça/ }).click();
  await canvas.click({ position: cell(5, 9) });
  assert.match(await page.locator('#battleLog').innerText(), /Armadilha de Caça/);
  await page.screenshot({ path: 'artifacts/preview/03-magic.png', fullPage: true });

  assert.deepEqual(errors, [], 'Phaser should not throw browser errors');
  console.log('PASS: Phaser starts, movement/PA works, enemy turn advances and spell is cast');
} finally {
  await browser.close();
}
