export class RenderManager {
  constructor(renderer) { this.renderer = renderer; }
  initialize(canvas) { this.renderer.initialize(canvas); }
  beginFrame() { this.renderer.beginFrame(); }
  endFrame() { this.renderer.endFrame(); }
  rect(...args) { this.renderer.rect(...args); }
  circle(...args) { this.renderer.circle(...args); }
  line(...args) { this.renderer.line(...args); }
  text(...args) { this.renderer.text(...args); }
}
