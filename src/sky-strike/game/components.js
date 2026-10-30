// Game-specific components are data-only. Systems own all behavior.
export class Player {
  constructor() {
    this.lives = 3;
    this.power = 1;
    this.invulnerable = 0;
    this.fireCooldown = 0;
    this.bombs = 1;
    this.shield = 0;
  }
}
export class Enemy {
  constructor({ kind = "scout", hp = 1, speed = 120, phase = 0 } = {}) {
    Object.assign(this, {
      kind,
      hp,
      speed,
      phase,
      fireCooldown: 1 + Math.random() * 1.5,
      score: kind === "heavy" ? 300 : kind === "zigzag" ? 180 : 100,
    });
  }
}
export class Projectile {
  constructor({ friendly = true, damage = 1, kind = "normal" } = {}) {
    Object.assign(this, { friendly, damage, kind });
  }
}
export class PowerUp {
  constructor(kind = "power") {
    this.kind = kind;
  }
}
export class Star {
  constructor(speed = 35, size = 1) {
    Object.assign(this, { speed, size });
  }
}
