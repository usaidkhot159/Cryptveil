// ═══════════════════════════════════════════
//  HUD
// ═══════════════════════════════════════════

export class HUD {
  constructor() {
    this.hpBar   = document.getElementById('hp-bar');
    this.hpVal   = document.getElementById('hp-val');
    this.atkVal  = document.getElementById('atk-val');
    this.goldVal = document.getElementById('gold-val');
    this.floorV  = document.getElementById('floor-val');
  }

  update(player, floor) {
    const pct = Math.max(0, player.hp / player.maxHp * 100);
    this.hpBar.style.width  = `${pct}%`;
    this.hpVal.textContent  = `${player.hp}/${player.maxHp}`;
    this.atkVal.textContent  = player.atk;
    this.goldVal.textContent = player.gold;
    this.floorV.textContent  = floor;

    // HP bar color
    if (pct < 25)       this.hpBar.style.background = 'linear-gradient(90deg, #5c0000, #ff2020)';
    else if (pct < 50)  this.hpBar.style.background = 'linear-gradient(90deg, #5c1010, #d94040)';
    else                this.hpBar.style.background = 'linear-gradient(90deg, #5c1010, #d94040)';
  }
}
