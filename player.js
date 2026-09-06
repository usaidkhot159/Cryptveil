// ═══════════════════════════════════════════
//  PLAYER
// ═══════════════════════════════════════════

import { TILE, CONFIG, TILES } from './constants.js';

export class Player {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.w = TILE - 4;
    this.h = TILE - 4;
    this.vx = 0;
    this.vy = 0;

    this.maxHp  = 100;
    this.hp     = 100;
    this.atk    = 10;
    this.def    = 0;
    this.gold   = 0;
    this.kills  = 0;
    this.xp     = 0;
    this.level  = 1;

    this.noDamageClear = true;
    this.inventory     = [];
    this.equippedWeapon = null;
    this.equippedArmor  = null;

    this.attackCooldown = 0;
    this.iFrames        = 0;  // invincibility frames after hit
    this.facing         = { x: 1, y: 0 };
  }

  get tileX() { return Math.floor((this.x + this.w / 2) / TILE); }
  get tileY() { return Math.floor((this.y + this.h / 2) / TILE); }
  get cx()    { return this.x + this.w / 2; }
  get cy()    { return this.y + this.h / 2; }

  update(dt, input, map) {
    // Cooldowns
    if (this.attackCooldown > 0) this.attackCooldown -= dt;
    if (this.iFrames > 0)        this.iFrames -= dt;

    // Movement
    const speed  = CONFIG.PLAYER_SPEED;
    let   dx = 0, dy = 0;

    if (input.isDown('ArrowUp')    || input.isDown('w') || input.isDown('W')) dy = -1;
    if (input.isDown('ArrowDown')  || input.isDown('s') || input.isDown('S')) dy =  1;
    if (input.isDown('ArrowLeft')  || input.isDown('a') || input.isDown('A')) dx = -1;
    if (input.isDown('ArrowRight') || input.isDown('d') || input.isDown('D')) dx =  1;

    // Normalize diagonal
    if (dx !== 0 && dy !== 0) { dx *= 0.707; dy *= 0.707; }

    if (dx !== 0 || dy !== 0) {
      this.facing.x = dx;
      this.facing.y = dy;
    }

    const nx = this.x + dx * speed * dt;
    const ny = this.y + dy * speed * dt;

    if (this._canMove(nx, this.y, map)) this.x = nx;
    if (this._canMove(this.x, ny, map)) this.y = ny;

    // XP level up
    const xpNeeded = this.level * 50;
    if (this.xp >= xpNeeded) {
      this.xp    -= xpNeeded;
      this.level++;
      this.maxHp += 20;
      this.hp     = Math.min(this.hp + 20, this.maxHp);
      this.atk   += 3;
    }
  }

  _canMove(nx, ny, map) {
    const corners = [
      [nx + 2,        ny + 2],
      [nx + this.w-2, ny + 2],
      [nx + 2,        ny + this.h-2],
      [nx + this.w-2, ny + this.h-2],
    ];
    return corners.every(([cx, cy]) => {
      const tx = Math.floor(cx / TILE);
      const ty = Math.floor(cy / TILE);
      return map.isWalkable(tx, ty);
    });
  }

  takeDamage(amount) {
    if (this.iFrames > 0) return 0;
    const dmg = Math.max(1, amount - this.def);
    this.hp  -= dmg;
    this.hp   = Math.max(0, this.hp);
    this.iFrames = 0.6;
    this.noDamageClear = false;
    return dmg;
  }

  heal(amount) {
    this.hp = Math.min(this.maxHp, this.hp + amount);
    return amount;
  }

  equipItem(item) {
    if (item.type === 'weapon') {
      this.equippedWeapon = item;
      this.atk = 10 + item.statValue;
    } else if (item.type === 'armor') {
      this.equippedArmor = item;
      this.def = item.statValue;
    }
  }
}
