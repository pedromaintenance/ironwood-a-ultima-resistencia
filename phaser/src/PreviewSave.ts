// The Phaser preview gets an isolated save slot. Never overwrite the published Canvas game.
import { validateLegacySave } from '../../src/core/save.js';

export const PREVIEW_SAVE_KEY = 'ironwood_phaser_preview_v1';
const MAX_IMPORT_SIZE = 2_000_000;

export function readPreviewSave(storage = localStorage) {
  try {
    const raw = storage.getItem(PREVIEW_SAVE_KEY);
    return raw ? validateLegacySave(JSON.parse(raw)) : null;
  } catch {
    // Corrupt saves should never prevent a fresh campaign.
    return null;
  }
}

export function writePreviewSave(snapshot, storage = localStorage) {
  validateLegacySave(snapshot);
  try {
    storage.setItem(PREVIEW_SAVE_KEY, JSON.stringify(snapshot));
    return true;
  } catch {
    return false;
  }
}

export async function parseImportedSave(file) {
  if (!file || file.size > MAX_IMPORT_SIZE) {
    throw new Error('O arquivo de campanha é grande demais (limite: 2 MB).');
  }
  let parsed;
  try {
    parsed = JSON.parse(await file.text());
  } catch {
    throw new Error('Arquivo JSON inválido.');
  }
  return validateLegacySave(parsed);
}

export function exportCampaign(snapshot, doc = document) {
  validateLegacySave(snapshot);
  const blob = new Blob([JSON.stringify(snapshot, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = doc.createElement('a');
  link.href = url;
  link.download = 'ironwood-phaser-campanha-v1.json';
  doc.body.appendChild(link);
  link.click();
  link.remove();
  // Revoke on a later tick so the browser has time to initiate the download.
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}
