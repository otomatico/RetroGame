import { MovementSystem, PaddleInputSystem, CollisionSystem, ScoreSystem } from "../engine/ecs/systems.js";
import { Transform, Velocity, Ball, Score, Paddle } from "../engine/ecs/components.js";
import { GAME_WIDTH, GAME_HEIGHT, COLORS, WIN_SCORE } from "./constants.js";

export class PongSystems {
  constructor() {
    this.movement = new MovementSystem();
    this.paddleInput = new PaddleInputSystem();
    this.collision = new CollisionSystem();
    this.score = new ScoreSystem();
    this.pointCooldown = 0;
  }

  reset() { this.score.reset(); this.pointCooldown = 0; }

  update(world, input, events, dt) {
    this.paddleInput.update(world, input, { width: GAME_WIDTH, height: GAME_HEIGHT }, dt);
    this.movement.update(world, dt);
    this.collision.update(world, { width: GAME_WIDTH, height: GAME_HEIGHT }, events);
    this.pointCooldown = Math.max(0, this.pointCooldown - dt);
    if (this.pointCooldown === 0) {
      // Score is converted to a single event, then the PlayState resets the ball.
    }
  }

  draw(world, renderer, localization) {
    renderer.beginFrame();
    renderer.line(GAME_WIDTH / 2, 0, GAME_WIDTH / 2, GAME_HEIGHT, COLORS.line, 4);
    renderer.rect(0, 0, GAME_WIDTH, 4, COLORS.line);
    renderer.rect(0, GAME_HEIGHT - 4, GAME_WIDTH, 4, COLORS.line);

    for (const id of world.query(Transform, Score)) {
      const score = world.getComponent(id, Score);
      renderer.text(String(this.score.values[score.player]), GAME_WIDTH / 2 + (score.player === 1 ? -70 : 70), 74,
        { color: score.player === 1 ? COLORS.cyan : COLORS.pink, size: 54 });
      renderer.text(localization.t(score.player === 1 ? "hud.player1" : "hud.player2"),
        GAME_WIDTH / 2 + (score.player === 1 ? -70 : 70), 112, { color: COLORS.muted, size: 11 });
    }
    renderer.text(localization.t("hud.firstTo", { score: WIN_SCORE }), GAME_WIDTH / 2, GAME_HEIGHT - 28,
      { color: COLORS.muted, size: 11 });

    for (const id of world.query(Transform)) {
      const t = world.getComponent(id, Transform);
      if (world.hasComponent(id, Ball)) {
        const ball = world.getComponent(id, Ball);
        renderer.circle(t.x, t.y, ball.radius, COLORS.white);
        renderer.circle(t.x - 2, t.y - 2, 2, COLORS.cyan);
      } else if (world.hasComponent(id, Score)) {
        continue;
      } else {
        const paddle = world.getComponent(id, Paddle);
        if (paddle) renderer.rect(t.x, t.y, t.width, t.height, paddle.player === 1 ? COLORS.cyan : COLORS.pink);
      }
    }
    renderer.endFrame();
  }
}
