// ═══════════════════════════════════════════
//  INPUT HANDLER
// ═══════════════════════════════════════════

export class InputHandler {
  constructor() {
    this._held    = new Set();
    this._pressed = new Set();

    this._onKeyDown = (e) => {
      this._held.add(e.key);
      this._pressed.add(e.key);
      // Prevent scroll on arrow/space
      if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '].includes(e.key)) {
        e.preventDefault();
      }
    };
    this._onKeyUp = (e) => {
      this._held.delete(e.key);
    };

    window.addEventListener('keydown', this._onKeyDown);
    window.addEventListener('keyup',   this._onKeyUp);
  }

  isDown(key)      { return this._held.has(key); }
  justPressed(key) {
    const v = this._pressed.has(key);
    this._pressed.delete(key);
    return v;
  }

  reset() {
    this._held.clear();
    this._pressed.clear();
  }

  destroy() {
    window.removeEventListener('keydown', this._onKeyDown);
    window.removeEventListener('keyup',   this._onKeyUp);
  }
}
