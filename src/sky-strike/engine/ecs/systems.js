import { Transform, Velocity, Paddle, Ball, Collider, Score } from "./components.js";

export class MovementSystem {
  update(world, dt) {
    for (const id of world.query(Transform, Velocity)) {
      const transform = world.getComponent(id, Transform);
      const velocity = world.getComponent(id, Velocity);
      transform.x += velocity.x * dt;
      transform.y += velocity.y * dt;
    }
  }
}

export class PaddleInputSystem {
  update(world, input, bounds, dt) {
    for (const id of world.query(Transform, Paddle)) {
      const t = world.getComponent(id, Transform);
      const p = world.getComponent(id, Paddle);
      const direction = (input.isDown(p.actionDown) ? 1 : 0) - (input.isDown(p.actionUp) ? 1 : 0);
      t.y += direction * p.speed * dt;
      t.y = Math.max(18, Math.min(bounds.height - t.height - 18, t.y));
    }
  }
}

export class CollisionSystem {
  update(world, bounds, events) {
    const ballId = world.query(Transform, Velocity, Ball, Collider)[0];
    if (!ballId) return;
    const ballT = world.getComponent(ballId, Transform);
    const velocity = world.getComponent(ballId, Velocity);
    const ball = world.getComponent(ballId, Ball);
    const r = ball.radius;

    if (ballT.y - r <= 0 && velocity.y < 0) {
      ballT.y = r; velocity.y = Math.abs(velocity.y); events.emit("wall-hit");
    } else if (ballT.y + r >= bounds.height && velocity.y > 0) {
      ballT.y = bounds.height - r; velocity.y = -Math.abs(velocity.y); events.emit("wall-hit");
    }

    for (const paddleId of world.query(Transform, Paddle, Collider)) {
      const pT = world.getComponent(paddleId, Transform);
      const paddle = world.getComponent(paddleId, Paddle);
      const movingTowardPaddle = paddle.player === 1 ? velocity.x < 0 : velocity.x > 0;
      const overlaps = ballT.x + r >= pT.x && ballT.x - r <= pT.x + pT.width &&
        ballT.y + r >= pT.y && ballT.y - r <= pT.y + pT.height;
      if (overlaps && movingTowardPaddle) {
        const center = pT.y + pT.height / 2;
        const offset = Math.max(-1, Math.min(1, (ballT.y - center) / (pT.height / 2)));
        const direction = paddle.player === 1 ? 1 : -1;
        const angle = offset * 0.95;
        const speed = Math.min(ball.speed + 40, Math.hypot(velocity.x, velocity.y) * 1.035);
        velocity.x = Math.cos(angle) * speed * direction;
        velocity.y = Math.sin(angle) * speed;
        ballT.x = paddle.player === 1 ? pT.x + pT.width + r : pT.x - r;
        events.emit("paddle-hit", { player: paddle.player });
      }
    }

    if (ballT.x + r < 0) events.emit("point", { player: 2 });
    else if (ballT.x - r > bounds.width) events.emit("point", { player: 1 });
  }
}

export class ScoreSystem {
  constructor() { this.values = { 1: 0, 2: 0 }; }
  reset() { this.values = { 1: 0, 2: 0 }; }
  addPoint(player) { this.values[player] += 1; return this.values[player]; }
  winner(target) {
    if (this.values[1] >= target) return 1;
    if (this.values[2] >= target) return 2;
    return null;
  }
}
