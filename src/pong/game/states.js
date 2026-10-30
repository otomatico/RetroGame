import { createWorld, resetBall } from "./createWorld.js";
import { PongSystems } from "./gameSystems.js";
import { GAME_WIDTH, GAME_HEIGHT, COLORS, WIN_SCORE } from "./constants.js";
import { Transform, Velocity, Ball, Score, Paddle } from "../engine/ecs/components.js";

class BaseState {
  enter(game) { game.statusLabel(); }
  update() {}
  handleAction() {}
  render() {}
}

export class MenuState extends BaseState {
  render(game, renderer) {
    let height = GAME_HEIGHT / 3;
    renderer.beginFrame();
    drawBackdrop(renderer);
    centered(renderer, game.localization.t("menu.title"), height-24, 48, COLORS.cyan);
    centered(renderer, game.localization.t("menu.subtitle"), height+28, 14, COLORS.muted);
    centered(renderer, game.localization.t("menu.controls"), height+40, 12, COLORS.white);
    centered(renderer, game.localization.t("menu.prompt"), height+70, 10, COLORS.pink);
    renderer.endFrame();
  }
  handleAction(game, action) {
    if (action === "confirm") {
      game.audio.play("start");
      game.stateMachine.change("playing", game);
    }
    if (action === "toggleLanguage") game.localization.toggle();
    if (action === "toggleSound") game.toggleSound();
  }
}

export class PlayState extends BaseState {
  enter(game) {
    if (!game.world || game.needsNewMatch) {
      game.world = createWorld();
      game.systems = new PongSystems();
      game.needsNewMatch = false;
    }
    game.pointPending = false;
    game.pointDelay = 0;
    game.events.on("point", this.onPoint = ({ player }) => {
      if (game.pointPending) return;
      game.pointPending = true;
      game.pointDelay = 0.65;
      game.pendingPoint = player;
      game.audio.play("score");
    });
    if (!game.ballStarted) {
      resetBall(game.world, Math.random() < 0.5 ? -1 : 1);
      const ballId = game.world.query(Transform, Velocity, Ball)[0];
      const velocity = game.world.getComponent(ballId, Velocity);
      velocity.x = 0; velocity.y = 0;
    }
    game.ballStarted = false;
  }
  exit(game) { if (this.onPoint) game.events.off("point", this.onPoint); }
  update(game, dt) {
    if (game.pointPending) {
      game.pointDelay -= dt;
      if (game.pointDelay <= 0) {
        game.systems.score.addPoint(game.pendingPoint);
        const winner = game.systems.score.winner(WIN_SCORE);
        if (winner) {
          game.winner = winner;
          game.audio.play("game-over");
          game.stateMachine.change("gameover", game);
          return;
        }
        resetBall(game.world, game.pendingPoint === 1 ? -1 : 1);
        const ballId = game.world.query(Transform, Velocity, Ball)[0];
        const v = game.world.getComponent(ballId, Velocity);
        v.x = 0; v.y = 0;
        game.pointPending = false;
      }
      return;
    }
    // The opening serve is launched on first confirm after entering play.
    if (game.serveWaiting) {
      const ballId = game.world.query(Transform, Velocity, Ball)[0];
      const v = game.world.getComponent(ballId, Velocity);
      if (v.x === 0 && v.y === 0) return;
      game.serveWaiting = false;
    }
    game.systems.update(game.world, game.input, game.events, dt);
    game.world.flushCommands();
  }
  handleAction(game, action) {
    if (action === "pause") game.stateMachine.change("paused", game);
    if (action === "confirm") {
      const ballId = game.world.query(Transform, Velocity, Ball)[0];
      const v = game.world.getComponent(ballId, Velocity);
      if (v.x === 0 && v.y === 0) resetBall(game.world, Math.random() < 0.5 ? -1 : 1);
      game.serveWaiting = false;
    }
    if (action === "toggleLanguage") game.localization.toggle();
    if (action === "toggleSound") game.toggleSound();
  }
  render(game, renderer) {
    let height = GAME_HEIGHT / 3;
    game.systems.draw(game.world, renderer, game.localization);
    if (game.pointPending) {
      renderer.rect(GAME_WIDTH / 2 - 130, height - 35, 260, 70, "#101a29");
      centered(renderer, `+1  ${game.localization.t(game.pendingPoint === 1 ? "hud.player1" : "hud.player2")}`, height, 19, COLORS.cyan);
    }
    const ballId = game.world.query(Transform, Velocity, Ball)[0];
    const v = ballId ? game.world.getComponent(ballId, Velocity) : null;
    if (v && v.x === 0 && v.y === 0 && !game.pointPending) {
      centered(renderer, game.localization.t("menu.prompt"), height+ 95, 13, COLORS.muted);
    }
  }
}

export class PauseState extends BaseState {
  render(game, renderer) {
    let height = GAME_HEIGHT / 3
    if (game.world && game.systems) game.systems.draw(game.world, renderer, game.localization);
    renderer.rect(0, 0, GAME_WIDTH, GAME_HEIGHT, "#070b13b8");
    centered(renderer, game.localization.t("pause.title"), height - 22, 42, COLORS.cyan);
    centered(renderer, game.localization.t("pause.prompt"), height + 35, 14, COLORS.white);
  }
  handleAction(game, action) {
    if (action === "pause" || action === "confirm") game.stateMachine.change("playing", game);
    if (action === "toggleLanguage") game.localization.toggle();
    if (action === "toggleSound") game.toggleSound();
  }
}

export class GameOverState extends BaseState {
  render(game, renderer) {
    let height = GAME_HEIGHT / 3
    if (game.world && game.systems) game.systems.draw(game.world, renderer, game.localization);
    renderer.rect(0, 0, GAME_WIDTH, GAME_HEIGHT, "#070b13d9");
    centered(renderer, game.localization.t("gameover.title"), height - 23, 28, COLORS.pink);
    centered(renderer, game.localization.t("gameover.winner", { player: game.winner }), height  + 4, 11, COLORS.white);
    centered(renderer, game.localization.t("gameover.prompt"), height  + 23, 13, COLORS.muted);
  }
  handleAction(game, action) {
    if (action === "restart" || action === "confirm") {
      game.needsNewMatch = true;
      game.stateMachine.change("playing", game);
    }
    if (action === "toggleLanguage") game.localization.toggle();
    if (action === "toggleSound") game.toggleSound();
  }
}

function drawBackdrop(renderer) {
  renderer.beginFrame();
  renderer.line(GAME_WIDTH / 2, 0, GAME_WIDTH / 2, GAME_HEIGHT, COLORS.line, 4);
  renderer.rect(0, 0, GAME_WIDTH, 4, COLORS.line);
  renderer.rect(0, GAME_HEIGHT - 4, GAME_WIDTH, 4, COLORS.line);
  renderer.endFrame();
}
function centered(renderer, text, y, size, color) {
  renderer.text(text, GAME_WIDTH / 2, y, { color, size });
}
