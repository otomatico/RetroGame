export class CanvasRenderer {
  initialize(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d", { alpha: false });
    if (!this.ctx) throw new Error("Canvas 2D is not available");
    this.width = canvas.width;
    this.height = canvas.height;
  }

  beginFrame() {
    const c = this.ctx;
    c.fillStyle = "#070b13";
    c.fillRect(0, 0, this.width, this.height);
  }
  endFrame() {}

  rect(x, y, width, height, color) {
    this.ctx.fillStyle = color;
    this.ctx.fillRect(Math.round(x), Math.round(y), Math.round(width), Math.round(height));
  }
  circle(x, y, radius, color) {
    const c = this.ctx; c.fillStyle = color; c.beginPath(); c.arc(x, y, radius, 0, Math.PI * 2); c.fill();
  }
  line(x1, y1, x2, y2, color, width = 1) {
    const c = this.ctx; c.strokeStyle = color; c.lineWidth = width;
    c.setLineDash([9, 14]); c.beginPath(); c.moveTo(x1, y1); c.lineTo(x2, y2); c.stroke(); c.setLineDash([]);
  }
  text(text, x, y, { color = "#eef5ff", size = 18, align = "center", font = "Space Mono, monospace" } = {}) {
    const c = this.ctx; c.fillStyle = color; c.font = `700 ${size}px ${font}`; c.textAlign = align; c.textBaseline = "middle"; c.fillText(text, x, y);
  }
}
