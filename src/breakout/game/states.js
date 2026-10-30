import { createWorld } from "./createWorld.js";
import { BreakoutSystem } from "./BreakoutSystem.js";
import { Transform, Ball } from "../engine/ecs/components.js";
import { WIDTH, HEIGHT, LEVEL_COUNT, STARTING_LIVES, COLORS } from "./constants.js";

class Base {
  global(g, a) {
    if (a === "toggleLanguage") g.localization.toggle();
    if (a === "toggleSound") g.toggleSound();
  }
  overlay(g, r, title, prompt, color = COLORS.cyan) {
    if (g.world && g.system) g.system.render(g.world, r, g.localization);
    else r.beginFrame();
    r.rect(0, 0, WIDTH, HEIGHT, "#050811dd");
    r.text(title, WIDTH / 2, HEIGHT / 2 - 30, {
      size: 36,
      color,
      font: "Space Grotesk, sans-serif",
    });
    r.text(prompt, WIDTH / 2, HEIGHT / 2 + 26, {
      size: 13,
      color: COLORS.white,
    });
  }
}
export class MenuState extends Base {
  render(g, r) {
    r.beginFrame();
    r.line(WIDTH / 2, 90, WIDTH / 2, HEIGHT - 30, COLORS.line, 3, [8, 14]);
    r.text(g.localization.t("menu.title"), WIDTH / 2, HEIGHT / 2 - 90, {
      size: 68,
      color: COLORS.cyan,
      font: "Space Grotesk, sans-serif",
    });
    r.text(g.localization.t("menu.subtitle"), WIDTH / 2, HEIGHT / 2 - 35, {
      size: 14,
      color: COLORS.muted,
    });
    r.text(g.localization.t("menu.controls"), WIDTH / 2, HEIGHT / 2 + 22, {
      size: 13,
      color: COLORS.white,
    });
    r.text(g.localization.t("menu.prompt"), WIDTH / 2, HEIGHT / 2 + 86, {
      size: 15,
      color: COLORS.pink,
    });
    r.text("5 LEVELS · 4 POWER-UPS", WIDTH / 2, HEIGHT - 40, {
      size: 11,
      color: COLORS.muted,
    });
    r.endFrame();
  }
  handleAction(g, a) {
    this.global(g, a);
    if (["confirm", "launch"].includes(a)) {
      g.newRun();
      g.stateMachine.change("playing", g);
    }
  }
}
export class PlayingState extends Base {
  enter(g) {
    if (!g.world || g.newGamePending) {
      g.world = createWorld(0);
      g.system = new BreakoutSystem();
      g.system.lives = STARTING_LIVES;
      g.system.newLevel(0);
      g.newGamePending = false;
    }
    g.system.levelCleared = false;
    g.bindGameEvents();
  }
  exit(g) {
    g.unbindGameEvents();
  }
  update(g, dt) {
    g.system.update(g.world, g.input, g.events, dt);
    if (g.system.lives <= 0) g.stateMachine.change("gameover", g);
    else if (g.system.levelCleared) g.stateMachine.change("levelcomplete", g);
  }
  render(g, r) {
    g.system.render(g.world, r, g.localization);
    if (g.world.query(Ball).some((id) => g.world.getComponent(id, Ball).stuck))
      r.text(g.localization.t("serve.prompt"), WIDTH / 2, HEIGHT - 18, {
        size: 11,
        color: COLORS.muted,
      });
  }
  handleAction(g, a) {
    this.global(g, a);
    if (a === "pause") g.stateMachine.change("paused", g);
    if (a === "launch") g.system.launch(g.world, g.events);
  }
}
export class PauseState extends Base {
  render(g, r) {
    this.overlay(
      g,
      r,
      g.localization.t("pause.title"),
      g.localization.t("pause.prompt"),
    );
  }
  handleAction(g, a) {
    this.global(g, a);
    if (["pause", "confirm", "launch"].includes(a))
      g.stateMachine.change("playing", g);
  }
}
export class LevelCompleteState extends Base {
  render(g, r) {
    this.overlay(
      g,
      r,
      g.localization.t("level.title"),
      g.localization.t("level.prompt"),
    );
    r.text(
      `SCORE ${String(g.system.score).padStart(5, "0")}`,
      WIDTH / 2,
      HEIGHT / 2 + 75,
      { size: 14, color: COLORS.pink },
    );
  }
  handleAction(g, a) {
    this.global(g, a);
    if (["confirm", "launch"].includes(a)) {
      const n = g.system.levelIndex + 1;
      if (n >= LEVEL_COUNT) {
        g.stateMachine.change("victory", g);
        return;
      }
      g.world.clear();
      g.world = createWorld(n);
      g.system.newLevel(n);
      g.stateMachine.change("playing", g);
    }
  }
}
export class GameOverState extends Base {
  enter(g) {
    g.audio.play("game-over");
  }
  render(g, r) {
    this.overlay(
      g,
      r,
      g.localization.t("gameover.title"),
      g.localization.t("gameover.prompt"),
      COLORS.pink,
    );
    r.text(
      `SCORE ${String(g.system.score).padStart(5, "0")}`,
      WIDTH / 2,
      HEIGHT / 2 + 75,
      { size: 15, color: COLORS.white },
    );
  }
  handleAction(g, a) {
    this.global(g, a);
    if (["restart", "confirm", "launch"].includes(a)) {
      g.newRun();
      g.stateMachine.change("playing", g);
    }
  }
}
export class VictoryState extends Base {
  enter(g) {
    g.audio.play("win");
  }
  render(g, r) {
    this.overlay(
      g,
      r,
      g.localization.t("victory.title"),
      g.localization.t("victory.prompt"),
    );
    r.text(
      `FINAL SCORE ${String(g.system.score).padStart(5, "0")}`,
      WIDTH / 2,
      HEIGHT / 2 + 75,
      { size: 15, color: COLORS.white },
    );
  }
  handleAction(g, a) {
    this.global(g, a);
    if (["restart", "confirm", "launch"].includes(a)) {
      g.newRun();
      g.stateMachine.change("playing", g);
    }
  }
}
