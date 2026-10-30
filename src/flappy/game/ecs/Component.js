// Componentes: solo datos; las reglas viven en sistemas.
export class Position { constructor(x, y) { this.x = x; this.y = y; } }
export class Velocity { constructor(vx = 0, vy = 0) { this.vx = vx; this.vy = vy; } }
export class Player { constructor() { this.radius = 12; } }
export class Pipe {
    constructor(width, gapY, gapHeight) {
        this.width = width;
        this.gapY = gapY;
        this.gapHeight = gapHeight;
        this.passed = false;
    }
}
export class Renderable {
    constructor(color, type = "circle") {
        this.color = color;
        this.type = type;
    }
}