// ═══════════════════════════════════════════
//  COMBAT SYSTEM
// ═══════════════════════════════════════════

import { CONFIG } from './constants.js';

export class CombatSystem {
  constructor(player, enemies, loot, effects, game) {
    this.player  = player;
    this.enemies = enemies;
    this.loot    = loot;
    this.effects = effects;
    this.game    = game;
  }

  update(dt, input) {
    // Player attacks
    if (input.justPressed('Space') || input.justPressed(' ')) {
      this._playerAttack();
    }

    // Enemy attacks player
    for (const e of this.enemies.alive()) {
      if (e.state === 'attack' && e.attackCd <= 0) {
        const dist = Math.hypot(e.cx - this.player.cx, e.cy - this.player.cy);
        if (dist < CONFIG.ENEMY_ATTACK_RANGE) {
          e.attackCd = 1.2;
          const dmg = this.player.takeDamage(e.atk);
          if (dmg > 0) {
            this.effects.damageNumber(this.player.cx, this.player.cy - 20, `-${dmg}`, 'player');
            this.effects.screenFlash('damage');
            this.effects.log(`${e.name} hits you for ${dmg}!`, 'damage');
          }
        }
      }
    }

    // Trap damage
    const key = `${this.player.tileX},${this.player.tileY}`;
    if (this.game.map.trapTiles.has(key) && !this._lastTrap) {
      const dmg = this.player.takeDamage(15);
      this.effects.damageNumber(this.player.cx, this.player.cy - 20, `-${dmg}`, 'player');
      this.effects.log('A trap! You take ' + dmg + ' damage.', 'damage');
      this._lastTrap = key;
    } else if (this._lastTrap && this._lastTrap !== key) {
      this._lastTrap = null;
    }
  }

  _playerAttack() {
    if (this.player.attackCooldown > 0) return;
    this.player.attackCooldown = CONFIG.ATTACK_COOLDOWN;

    let hit = false;
    for (const e of this.enemies.alive()) {
      const dist = Math.hypot(e.cx - this.player.cx, e.cy - this.player.cy);
      if (dist <= CONFIG.ATTACK_RANGE) {
        const isCrit = Math.random() < 0.15;
        let   dmg    = this.player.atk + Math.floor(Math.random() * 5);
        if (isCrit) dmg = Math.floor(dmg * 1.8);

        e.takeDamage(dmg);
        const cls = isCrit ? 'crit' : 'enemy';
        this.effects.damageNumber(e.cx, e.cy - 20, isCrit ? `${dmg}!!` : `-${dmg}`, cls);

        if (e.dead) {
          this.player.kills++;
          this.player.xp   += e.xp;
          const gold = e.goldDrop();
          this.player.gold += gold;
          this.effects.log(`${e.name} defeated! +${gold} gold`, 'loot');
          this.loot.spawnFromEnemy(e);
          this.game.achievements.check(e.isBoss ? 'boss_slayer' : 'first_blood');
        } else {
          this.effects.log(`You hit ${e.name} for ${isCrit ? '⚡CRIT ' : ''}${dmg}!`, 'damage');
        }
        hit = true;
      }
    }
    if (!hit) {
      this.effects.log('You swing at the air.', 'info');
    }
  }
}
