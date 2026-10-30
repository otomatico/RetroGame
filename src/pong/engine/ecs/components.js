// Components are data only. They contain no rendering or input behavior.
export class Transform {
  constructor(x = 0, y = 0, width = 10, height = 10) {
    Object.assign(this, { x, y, width, height });
  }
}
export class Velocity {
  constructor(x = 0, y = 0) { this.x = x; this.y = y; }
}
export class Paddle {
  constructor(player, actionUp, actionDown, speed = 440) {
    Object.assign(this, { player, actionUp, actionDown, speed });
  }
}
export class Ball {
  constructor({ radius = 9, speed = 360 } = {}) {
    Object.assign(this, { radius, speed, lastHit:0 });
  }
}
export class Collider {
  constructor(kind) { this.kind = kind; }
}
export class Score {
  constructor(player = 1, value = 0) { this.player = player; this.value = value; }
}
