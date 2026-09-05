// ═══════════════════════════════════════════
//  CRYPTVEIL — Main Bootstrap
// ═══════════════════════════════════════════

import { Game }          from './game.js';
import { ScreenManager } from './screens.js';
import { Storage }       from './storage.js';
import { Achievements }  from './achievements.js';

window.addEventListener('DOMContentLoaded', () => {
  const storage      = new Storage();
  const achievements = new Achievements(storage);
  const screens      = new ScreenManager();
  const game         = new Game({ storage, achievements, screens });

  // ── Title buttons ──────────────────────────
  document.getElementById('btn-new-game').addEventListener('click', () => {
    screens.show('game');          // show game screen FIRST
    game.startNewGame();           // then start (canvas is now visible for sizing)
  });

  document.getElementById('btn-records').addEventListener('click', () => {
    screens.showRecords(storage.getRecords());
  });

  document.getElementById('btn-achievements-title').addEventListener('click', () => {
    screens.showAchievements(achievements.getAll());
  });

  // ── Close buttons ──────────────────────────
  document.getElementById('btn-close-records').addEventListener('click', () =>
    screens.closeOverlay('records'));

  document.getElementById('btn-close-achievements').addEventListener('click', () =>
    screens.closeOverlay('achievements'));

  document.getElementById('btn-close-inventory').addEventListener('click', () => {
    screens.closeOverlay('inventory');
    game.paused = false;
  });

  // ── HUD buttons ────────────────────────────
  document.getElementById('btn-inventory').addEventListener('click', () => {
    if (!game.player) return;
    game.paused = true;
    screens.showInventory(game.player);
  });

  document.getElementById('btn-map-toggle').addEventListener('click', () => {
    game.toggleMinimap();
  });

  document.getElementById('btn-pause').addEventListener('click', () => {
    game.paused = true;
    screens.showOverlay('pause');
  });

  // ── Pause ──────────────────────────────────
  document.getElementById('btn-resume').addEventListener('click', () => {
    game.paused = false;
    screens.closeOverlay('pause');
  });

  document.getElementById('btn-pause-title').addEventListener('click', () => {
    game.stopGame();
    screens.closeOverlay('pause');
    screens.show('title');
  });

  // ── Game Over ──────────────────────────────
  document.getElementById('btn-retry').addEventListener('click', () => {
    screens.closeOverlay('gameover');
    screens.show('game');          // ensure game screen is visible
    game.startNewGame();
  });

  document.getElementById('btn-go-title').addEventListener('click', () => {
    game.stopGame();
    screens.closeOverlay('gameover');
    screens.show('title');
  });

  // ── Win ────────────────────────────────────
  document.getElementById('btn-win-retry').addEventListener('click', () => {
    screens.closeOverlay('win');
    screens.show('game');
    game.startNewGame();
  });

  document.getElementById('btn-win-title').addEventListener('click', () => {
    game.stopGame();
    screens.closeOverlay('win');
    screens.show('title');
  });

  // ── Expose globally for effects.js damageNumber helper ──
  window.__cryptveil = { game, storage, achievements };
});
