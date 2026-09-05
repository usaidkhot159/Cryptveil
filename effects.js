// ═══════════════════════════════════════════
//  EFFECTS — Damage numbers, flashes, log, popups
// ═══════════════════════════════════════════

export class Effects {
  constructor() {
    this.logEl   = document.getElementById('log-entries');
    this.popup   = document.getElementById('loot-popup');
    this._popupTimer = null;
  }

  damageNumber(cx, cy, text, type = 'enemy') {
    const el = document.createElement('div');
    el.className = `damage-number ${type}`;
    el.textContent = text;

    // Convert world-to-screen (rough estimate; canvas is offset by HUD)
    const canvas = document.getElementById('game-canvas');
    const player = window.__cryptveil?.game?.player;
    if (!player) return;

    const camX = player.cx - canvas.width  / 2;
    const camY = player.cy - canvas.height / 2;

    const sx = cx - camX;
    const sy = cy - camY + 52; // HUD offset

    el.style.left = `${sx + (Math.random() - 0.5) * 20}px`;
    el.style.top  = `${sy}px`;

    document.body.appendChild(el);
    el.addEventListener('animationend', () => el.remove());
  }

  screenFlash(type = 'damage') {
    const el = document.createElement('div');
    el.className = `screen-flash ${type}`;
    document.body.appendChild(el);
    el.addEventListener('animationend', () => el.remove());
  }

  log(msg, type = 'info') {
    const el = document.createElement('div');
    el.className = `log-entry ${type}`;
    el.textContent = msg;
    this.logEl.appendChild(el);

    // Keep last 5 entries
    while (this.logEl.children.length > 5) {
      this.logEl.removeChild(this.logEl.firstChild);
    }

    // Auto-fade old entries
    setTimeout(() => el.style.opacity = '0.3', 3000);
  }

  showLootPopup(item) {
    if (this._popupTimer) clearTimeout(this._popupTimer);

    const rarityLabel = {
      common: 'Common', uncommon: 'Uncommon', rare: 'Rare',
      epic: 'Epic', legendary: 'Legendary',
    }[item.rarity] ?? 'Common';

    const statLabel = { atk: 'ATK', def: 'DEF', hp: 'HP', gold: 'Gold' }[item.stat] ?? item.stat;

    this.popup.innerHTML = `
      <div class="loot-title">Item Found</div>
      <div class="loot-item">
        <div class="loot-icon">${item.icon}</div>
        <div class="loot-name ${item.rarity}">${item.name}</div>
        <div class="loot-stat">+${item.statValue} ${statLabel} · ${rarityLabel}</div>
      </div>
      <button class="loot-close" id="loot-close-btn">Continue</button>
    `;
    this.popup.classList.remove('hidden');

    const close = () => {
      this.popup.classList.add('hidden');
      clearTimeout(this._popupTimer);
    };

    document.getElementById('loot-close-btn')?.addEventListener('click', close);
    this._popupTimer = setTimeout(close, 4000);
  }
}
