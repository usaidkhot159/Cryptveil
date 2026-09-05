// ═══════════════════════════════════════════
//  ENEMIES
// ═══════════════════════════════════════════

import { TILE, CONFIG, ENEMY_TYPES } from './constants.js';

export class Enemy {
  constructor(type, x, y, isBoss = false) {
    const def     = ENEMY_TYPES[type];
    this.type     = type;
    this.name     = def.name;
    this.icon     = def.icon;
    this.x        = x;
    this.y        = y;
    this.w        = TILE - 4;
    this.h        = TILE - 4;
    this.isBoss   = isBoss;

    const scale   = isBoss ? 1 : (1 + Math.random() * 0.3);
    this.maxHp    = Math.floor(def.hp  * scale);
    this.hp       = this.maxHp;
    this.atk      = Math.floor(def.atk * scale);
    this.speed    = def.speed + Math.random() * 20;
    this.xp       = def.xp;
    this.goldRange= def.gold;

    this.state    = 'idle';   // idle | chase | attack
    this.attackCd = 0;
    this.dead     = false;
    this.alert    = false;
  }

  get cx() { return this.x + this.w / 2; }
  get cy() { return this.y + this.h / 2; }

  update(dt, map, player) {
    if (this.dead) return;
    if (this.attackCd > 0) this.attackCd -= dt;

    const dist = Math.hypot(this.cx - player.cx, this.cy - player.cy);

    if (dist < CONFIG.ENEMY_DETECT_RANGE) {
      this.alert = true;
      this.state = 'chase';
    }

    if (this.state === 'chase') {
      if (dist < CONFIG.ENEMY_ATTACK_RANGE) {
        this.state = 'attack';
      } else {
        // Move toward player
        const angle = Math.atan2(player.cy - this.cy, player.cx - this.cx);
        const nx = this.x + Math.cos(angle) * this.speed * dt;
        const ny = this.y + Math.sin(angle) * this.speed * dt;

        if (map.isWalkable(Math.floor((nx + this.w/2) / TILE), Math.floor((this.y + this.h/2) / TILE))) this.x = nx;
        if (map.isWalkable(Math.floor((this.x + this.w/2) / TILE), Math.floor((ny + this.h/2) / TILE))) this.y = ny;
      }
    }
  }

  takeDamage(amount) {
    this.hp  -= amount;
    if (this.hp <= 0) { this.hp = 0; this.dead = true; }
    return amount;
  }

  goldDrop() {
    return Math.floor(this.goldRange[0] + Math.random() * (this.goldRange[1] - this.goldRange[0]));
  }
}

export class EnemyManager {
  constructor(map, player, floor) {
    this.enemies      = [];
    this.bossDefeated = false;
    this._spawn(map, player, floor);
  }

  _spawn(map, player, floor) {
    const typeKeys  = ['goblin','zombie','skeleton','wraith','ogre'];
    const available = typeKeys.slice(0, Math.min(Math.ceil(floor * 1.5), typeKeys.length));

    // Enemies in non-start, non-boss rooms
    for (let i = 1; i < map.rooms.length - 1; i++) {
      const room  = map.rooms[i];
      const count = 1 + Math.floor(Math.random() * 2) + Math.floor(floor / 2);
      for (let j = 0; j < count; j++) {
        const type = available[Math.floor(Math.random() * available.length)];
        const ex   = (room.x + 1 + Math.floor(Math.random() * (room.w - 2))) * TILE;
        const ey   = (room.y + 1 + Math.floor(Math.random() * (room.h - 2))) * TILE;
        this.enemies.push(new Enemy(type, ex, ey));
      }
    }

    // Boss in last room
    const boss = map.bossRoom;
    const bx   = boss.cx * TILE;
    const by   = boss.cy * TILE;
    const b    = new Enemy('boss', bx, by, true);
    b.name     = `${['Shadowlord','Voidwarden','Cryptking'][Math.min(floor-1,2)]}`;
    this.boss  = b;
    this.enemies.push(b);
  }

  update(dt, map, player) {
    for (const e of this.enemies) {
      if (!e.dead) e.update(dt, map, player);
    }
    if (this.boss && this.boss.dead && !this.bossDefeated) {
      this.bossDefeated = true;
    }
  }

  alive() { return this.enemies.filter(e => !e.dead); }
}
