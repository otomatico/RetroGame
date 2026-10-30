export class Game {
  constructor({ input, renderer, resources, localization, audio, events, stateMachine, canvas }) {
    Object.assign(this, { input, renderer, resources, localization, audio, events, stateMachine, canvas });
    this.running = false;
    this.lastTime = 0;
    this.accumulator = 0;
    this.fixedDelta = 1 / 120;
    this.maxFrameDelta = 0.05;
    this.frame = this.frame.bind(this);
  }

  async initialize() {
    await this.resources.loadManifest("./assets/manifest.json");
    await this.localization.setLocale("es");
    this.renderer.initialize(this.canvas);
  }

  start() {
    if (this.running) return;
    this.running = true;
    this.lastTime = 0;
    requestAnimationFrame(this.frame);
  }

  stop() { this.running = false; }

  frame(timestamp) {
    if (!this.running) return;
    const now = timestamp / 1000;
    const elapsed = this.lastTime === 0 ? 0 : Math.min(now - this.lastTime, this.maxFrameDelta);
    this.lastTime = now;
    this.input.updateFrame?.();
    for (const action of this.input.consumeActions()) this.stateMachine.handleAction(this, action);
    this.accumulator += elapsed;
    while (this.accumulator >= this.fixedDelta) {
      this.stateMachine.update(this, this.fixedDelta);
      this.accumulator -= this.fixedDelta;
    }
    this.stateMachine.render(this, this.renderer);
    requestAnimationFrame(this.frame);
  }
}
