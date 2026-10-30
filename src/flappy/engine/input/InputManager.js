export class InputManager {
  constructor(target = window) {
    this.target = target;
    this.down = new Set();
    this.pressed = new Set();
    this.released = new Set();
    this.actions = [];
    this.bindings = new Map([
      ["KeyA", "steerLeft"], ["ArrowLeft", "steerLeft"],
      ["KeyD", "steerRight"], ["ArrowRight", "steerRight"],
      ["KeyW", "accelerate"], ["ArrowUp", "accelerate"], ["KeyS", "brake"], ["ArrowDown", "brake"],
      ["Space", "nitro"], ["Enter", "confirm"], ["KeyP", "pause"], ["Escape", "pause"],
      ["KeyR", "restart"], ["KeyM", "toggleSound"], ["KeyL", "toggleLanguage"]
    ]);
    this.onKeyDown = e => {
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Space"].includes(e.code)) e.preventDefault();
      if (!this.down.has(e.code)) {
        this.down.add(e.code);
        const action = this.bindings.get(e.code);
        if (action) this.actions.push(action);
        this.pressed.add(e.code);
      }
    };
    this.onKeyUp = e => {
      this.down.delete(e.code);
      this.released.add(e.code);
    };
    this.onBlur = () => { this.down.clear(); this.pressed.clear(); this.released.clear(); };
    target.addEventListener("keydown", this.onKeyDown);
    target.addEventListener("keyup", this.onKeyUp);
    window.addEventListener("blur", this.onBlur);
  }

  isDown(action) {
    for (const [code, mapped] of this.bindings) if (mapped === action && this.down.has(code)) return true;
    return false;
  }
  wasPressed(code) { return this.pressed.has(code); }
  wasReleased(code) { return this.released.has(code); }
  update() { this.pressed.clear(); this.released.clear(); }
  consumeActions() { const result = this.actions.splice(0); return result; }
  destroy() {
    this.target.removeEventListener("keydown", this.onKeyDown);
    this.target.removeEventListener("keyup", this.onKeyUp);
    window.removeEventListener("blur", this.onBlur);
  }
}
