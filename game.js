// ═══════════════════════════════════════════
//  GAME — Core loop, orchestration
// ═══════════════════════════════════════════

import { DungeonGenerator } from './dungeon.js';
import { Player }           from './player.js';
import { EnemyManager }     from './enemies.js';
import { Renderer }         from './renderer.js';
import { MinimapRenderer }  from './minimap.js';
import { InputHandler }     from './input.js';
import { LootSystem }       from './loot.js';
import { CombatSystem }     from './combat.js';
import { HUD }              from './hud.js';
import { Effects }          from './effects.js';
import { TILE, CONFIG }     from './constants.js';

export class Game {
  constructor({ storage, achievements, screens }) {
    this.storage      = storage;
    this.achievements = achievements;
    this.screens      = screens;

    this.canvas    = document.getElementById('game-canvas');
    this.ctx       = this.canvas.getContext('2d');
    this.mmCanvas  = document.getElementById('minimap-canvas');
    this.mmCtx     = this.mmCanvas.getContext('2d');

    this.paused    = false;
    this.running   = false;
    this.lastTime  = 0;
    this._gameOverPending = false;

    this.input    = new InputHandler();
    this.hud      = new HUD();
    this.effects  = new Effects();

    this.resizeHandler = () => this.resize();
    window.addEventListener('resize', this.resizeHandler);
    this.resize();
  }

  resize() {
    this.canvas.width  = window.innerWidth;
    this.canvas.height = window.innerHeight - 52;
  }

  startNewGame() {
    // Full stop before building new game
    this.stopGame();

    this.paused           = false;
    this.running          = true;
    this.floor            = 1;
    this.startTime        = Date.now();
    this._gameOverPending = false;
    this._deathHandled    = false;

    // ALWAYS create a fresh player on new game — never reuse dead one
    this.player = null;

    this._buildFloor();
    this._startLoop();
  }

  _buildFloor() {
    const gen  = new DungeonGenerator(CONFIG.MAP_W, CONFIG.MAP_H, this.floor);
    this.map   = gen.generate();

    // Player — spawn in start room centre
    const start = this.map.startRoom;
    const px    = (start.cx) * TILE;
    const py    = (start.cy) * TILE;

    if (!this.player) {
      this.player = new Player(px, py);
    } else {
      // Keep stats but reset position for new floor
      this.player.x  = px;
      this.player.y  = py;
      this.player.vx = 0;
      this.player.vy = 0;
    }

    this.enemies = new EnemyManager(this.map, this.player, this.floor);
    this.loot    = new LootSystem(this.map, this.enemies);
    this.combat  = new CombatSystem(this.player, this.enemies, this.loot, this.effects, this);

    this.renderer = new Renderer(this.ctx, this.canvas, this.map, this.player, this.enemies, this.loot);
    this.minimap  = new MinimapRenderer(this.mmCtx, this.mmCanvas, this.map, this.player);

    this.hud.update(this.player, this.floor);
    this.input.reset();
  }

  _startLoop() {
    // Reset lastTime so the first dt is not enormous
    this.lastTime = performance.now();

    const loop = (ts) => {
      if (!this.running) return;
      const dt = Math.min((ts - this.lastTime) / 1000, 0.05);
      this.lastTime = ts;
      if (!this.paused) this._update(dt);
      this._draw();
      this._rafId = requestAnimationFrame(loop);
    };
    this._rafId = requestAnimationFrame(loop);
  }

  _update(dt) {
    // Guard: never update after death is handled
    if (this._deathHandled) return;

    // Player movement
    this.player.update(dt, this.input, this.map);

    // Combat
    this.combat.update(dt, this.input);

    // Enemies
    this.enemies.update(dt, this.map, this.player);

    // Loot pickup
    this.loot.checkPickup(this.player, this);

    // Fog of war reveal
    this.map.reveal(this.player.tileX, this.player.tileY, 6);

    // Check floor exit (boss must be defeated first)
    if (this.map.isExit(this.player.tileX, this.player.tileY) && this.enemies.bossDefeated) {
      this._nextFloor();
      return;
    }

    // Check death
    if (this.player.hp <= 0) {
      this._deathHandled = true;
      this._gameOver();
      return;
    }

    // HUD
    this.hud.update(this.player, this.floor);

    // Achievements
    this._checkAchievements();
  }

  _draw() {
    this.renderer.draw();
    this.minimap.draw();
  }

  _nextFloor() {
    if (this.floor >= CONFIG.MAX_FLOORS) {
      this._win();
      return;
    }
    this.floor++;
    this.effects.log(`Descending to floor ${this.floor}…`, 'info');
    this._buildFloor();
  }

  _gameOver() {
    this.running = false;
    const run = this._buildRunRecord();
    this.storage.saveRecord(run);
    this.achievements.check('first_death');

    // Small delay so the death flash is visible before overlay appears
    setTimeout(() => {
      this.screens.showGameOver(run);
    }, 600);
  }

  _win() {
    this.running = false;
    const run = this._buildRunRecord();
    this.storage.saveRecord(run);
    this.achievements.check('boss_slayer');

    setTimeout(() => {
      this.screens.showWin(run);
    }, 600);
  }

  _buildRunRecord() {
    return {
      floor: this.floor,
      kills: this.player ? this.player.kills : 0,
      gold:  this.player ? this.player.gold  : 0,
      time:  Math.floor((Date.now() - this.startTime) / 1000),
      date:  new Date().toLocaleDateString(),
    };
  }

  _checkAchievements() {
    if (this.player.kills >= 1)    this.achievements.check('first_blood');
    if (this.player.gold >= 1000)  this.achievements.check('treasure_hunter');
    if (this.floor >= 5)           this.achievements.check('survivor');
    if (this.player.noDamageClear) this.achievements.check('no_damage');
  }

  stopGame() {
    this.running = false;
    if (this._rafId) {
      cancelAnimationFrame(this._rafId);
      this._rafId = null;
    }
    this.input.reset();
  }

  toggleMinimap() {
    if (this.mmCanvas) {
      this.mmCanvas.style.display =
        this.mmCanvas.style.display === 'none' ? '' : 'none';
    }
  }
}
