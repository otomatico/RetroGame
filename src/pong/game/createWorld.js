import { World } from "../engine/ecs/World.js";
import { Transform, Velocity, Paddle, Ball, Collider, Score } from "../engine/ecs/components.js";
import { GAME_WIDTH, GAME_HEIGHT, PADDLE_WIDTH, PADDLE_HEIGHT, BALL_RADIUS } from "./constants.js";

export function createWorld() {
  const world = new World();
  const left = world.createEntity();
  world.addComponent(left, new Transform(38, GAME_HEIGHT / 2 - PADDLE_HEIGHT / 2, PADDLE_WIDTH, PADDLE_HEIGHT));
  world.addComponent(left, new Paddle(1, "leftUp", "leftDown"));
  world.addComponent(left, new Collider("paddle"));

  const right = world.createEntity();
  world.addComponent(right, new Transform(GAME_WIDTH - 38 - PADDLE_WIDTH, GAME_HEIGHT / 2 - PADDLE_HEIGHT / 2, PADDLE_WIDTH, PADDLE_HEIGHT));
  world.addComponent(right, new Paddle(2, "rightUp", "rightDown"));
  world.addComponent(right, new Collider("paddle"));

  const ball = world.createEntity();
  world.addComponent(ball, new Transform(GAME_WIDTH / 2, GAME_HEIGHT / 2, BALL_RADIUS * 2, BALL_RADIUS * 2));
  world.addComponent(ball, new Velocity(0, 0));
  world.addComponent(ball, new Ball({ radius: BALL_RADIUS, speed: 360 }));
  world.addComponent(ball, new Collider("ball"));

  world.addComponent(world.createEntity(), new Score(1, 0));
  world.addComponent(world.createEntity(), new Score(2, 0));
  return world;
}

export function resetBall(world, direction = Math.random() < 0.5 ? -1 : 1) {
  const id = world.query(Transform, Velocity, Ball)[0];
  if (!id) return;
  const t = world.getComponent(id, Transform);
  const v = world.getComponent(id, Velocity);
  const b = world.getComponent(id, Ball);
  t.x = GAME_WIDTH / 2; t.y = GAME_HEIGHT / 2;
  const angle = (Math.random() * 0.7 - 0.35);
  v.x = Math.cos(angle) * b.speed * direction;
  v.y = Math.sin(angle) * b.speed;
}
