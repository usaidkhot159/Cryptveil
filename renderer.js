// ═══════════════════════════════════════════
//  RENDERER — Canvas tile + entity drawing
// ═══════════════════════════════════════════

import { TILE, TILES } from './constants.js';

const COLORS = {
  void:    '#08080f',
  floor:   '#1a1a2e',
  floorAlt:'#16162a',
  wall:    '#0c0c18',
  wallTop: '#252540',
  door:    '#3a2a10',
  stairs:  '#1a3a1a',
  stairsFg:'#2ab832',
  trap:    '#3a0808',
  trapFg:  '#d94040',
  fog:     'rgba(8,8,15,0.7)',
};

export class Renderer {
  constructor(ctx, canvas, map, player, enemies, loot) {
    this.ctx     = ctx;
    this.canvas  = canvas;
    this.map     = map;
    this.player  = player;
    this.enemies = enemies;
    this.loot    = loot;

    this.camX    = 0;
    this.camY    = 0;
    this.tick    = 0;
  }

  draw() {
    this.tick++;
    const ctx = this.ctx;
    const W   = this.canvas.width;
    const H   = this.canvas.height;

    // Camera follows player
    this.camX = Math.floor(this.player.cx - W / 2);
    this.camY = Math.floor(this.player.cy - H / 2);

    ctx.fillStyle = COLORS.void;
    ctx.fillRect(0, 0, W, H);

    ctx.save();
    ctx.translate(-this.camX, -this.camY);

    this._drawTiles(W, H);
    this._drawLoot();
    this._drawEnemies();
    this._drawPlayer();

    ctx.restore();
  }

  _drawTiles(W, H) {
    const ctx  = this.ctx;
    const map  = this.map;
    const tx0  = Math.max(0, Math.floor(this.camX / TILE) - 1);
    const ty0  = Math.max(0, Math.floor(this.camY / TILE) - 1);
    const tx1  = Math.min(map.w, tx0 + Math.ceil(W / TILE) + 3);
    const ty1  = Math.min(map.h, ty0 + Math.ceil(H / TILE) + 3);

    for (let ty = ty0; ty < ty1; ty++) {
      for (let tx = tx0; tx < tx1; tx++) {
        const tile     = map.tileAt(tx, ty);
        const revealed = map.revealed[ty * map.w + tx];
        const px       = tx * TILE;
        const py       = ty * TILE;

        if (!revealed) {
          ctx.fillStyle = COLORS.void;
          ctx.fillRect(px, py, TILE, TILE);
          continue;
        }

        const isKnown = revealed;
        const isVisible = this._inViewRange(tx, ty);

        // Base tile
        switch (tile) {
          case TILES.FLOOR:
            ctx.fillStyle = (tx + ty) % 2 === 0 ? COLORS.floor : COLORS.floorAlt;
            ctx.fillRect(px, py, TILE, TILE);
            // Floor border
            ctx.fillStyle = 'rgba(0,0,0,0.25)';
            ctx.fillRect(px, py, TILE, 1);
            ctx.fillRect(px, py, 1, TILE);
            break;

          case TILES.WALL:
            ctx.fillStyle = COLORS.wall;
            ctx.fillRect(px, py, TILE, TILE);
            // Wall face highlight
            const floorBelow = map.tileAt(tx, ty + 1);
            if (floorBelow === TILES.FLOOR || floorBelow === TILES.DOOR) {
              ctx.fillStyle = COLORS.wallTop;
              ctx.fillRect(px, py, TILE, 6);
            }
            // Wall texture
            ctx.fillStyle = 'rgba(255,255,255,0.02)';
            for (let i = 0; i < 3; i++) {
              const nx = px + 4 + (i * 9);
              ctx.fillRect(nx, py + 8, 5, 12);
            }
            break;

          case TILES.STAIRS:
            ctx.fillStyle = COLORS.stairs;
            ctx.fillRect(px, py, TILE, TILE);
            ctx.fillStyle = COLORS.stairsFg;
            ctx.font = `${TILE - 8}px serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('▼', px + TILE/2, py + TILE/2);
            break;

          default:
            ctx.fillStyle = COLORS.void;
            ctx.fillRect(px, py, TILE, TILE);
        }

        // Trap overlay
        if (map.trapTiles.has(`${tx},${ty}`) && revealed) {
          if (isVisible) {
            ctx.fillStyle = COLORS.trap;
            ctx.fillRect(px + 4, py + 4, TILE - 8, TILE - 8);
            ctx.fillStyle = COLORS.trapFg;
            ctx.font = `12px serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('⚠', px + TILE/2, py + TILE/2);
          }
        }

        // Fog of war: seen but not currently visible
        if (isKnown && !isVisible) {
          ctx.fillStyle = COLORS.fog;
          ctx.fillRect(px, py, TILE, TILE);
        }
      }
    }
  }

  _inViewRange(tx, ty) {
    const r  = 7;
    const dx = tx - this.player.tileX;
    const dy = ty - this.player.tileY;
    return dx*dx + dy*dy <= r*r;
  }

  _drawEnemies() {
    const ctx = this.ctx;
    for (const e of this.enemies.alive()) {
      if (!this.map.revealed[Math.floor(e.cy / TILE) * this.map.w + Math.floor(e.cx / TILE)]) continue;

      // Shadow
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.beginPath();
      ctx.ellipse(e.cx, e.y + e.h, e.w/2 - 2, 5, 0, 0, Math.PI * 2);
      ctx.fill();

      // HP bar
      const barW = e.isBoss ? 80 : 28;
      const barH = 4;
      const bx   = e.cx - barW/2;
      const by   = e.y - 10;
      ctx.fillStyle = '#1a0000';
      ctx.fillRect(bx, by, barW, barH);
      const pct = e.hp / e.maxHp;
      ctx.fillStyle = pct > 0.5 ? '#2ab832' : pct > 0.25 ? '#e8a020' : '#d94040';
      ctx.fillRect(bx, by, barW * pct, barH);

      // Emoji
      const size = e.isBoss ? TILE + 8 : TILE - 2;
      ctx.font = `${size}px serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Alert flash
      if (e.alert && this.tick % 60 < 30) {
        ctx.shadowColor = '#d94040';
        ctx.shadowBlur  = 12;
      }
      ctx.fillText(e.icon, e.cx, e.cy);
      ctx.shadowBlur = 0;

      // Boss name
      if (e.isBoss) {
        ctx.font = 'bold 10px Cinzel, serif';
        ctx.fillStyle = '#e8c56a';
        ctx.textAlign = 'center';
        ctx.fillText(e.name, e.cx, e.y - 16);
      }
    }
  }

  _drawPlayer() {
    const ctx = this.ctx;
    const p   = this.player;

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.beginPath();
    ctx.ellipse(p.cx, p.y + p.h, p.w/2 - 2, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Glow
    ctx.shadowColor = 'rgba(232,197,106,0.5)';
    ctx.shadowBlur  = 12;

    // Invincibility flash
    if (p.iFrames > 0 && this.tick % 8 < 4) {
      ctx.globalAlpha = 0.5;
    }

    ctx.font = `${TILE}px serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🧙', p.cx, p.cy);

    ctx.globalAlpha = 1;
    ctx.shadowBlur  = 0;
  }

  _drawLoot() {
    const ctx = this.ctx;
    for (const item of this.loot.items) {
      if (item.picked) continue;
      if (!this.map.revealed[Math.floor(item.y / TILE) * this.map.w + Math.floor(item.x / TILE)]) continue;

      // Bob animation
      const bob = Math.sin(this.tick * 0.05) * 2;
      ctx.font = `${TILE - 6}px serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(item.icon, item.x, item.y + bob);
    }
  }
}
