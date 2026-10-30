import { Game } from "./engine/Game.js";
import { StateMachine } from "./engine/StateMachine.js";
import { EventBus } from "./engine/EventBus.js";
import { InputManager } from "./engine/input/InputManager.js";
import { CanvasRenderer } from "./engine/rendering/CanvasRenderer.js";
import { RenderManager } from "./engine/rendering/RenderManager.js";
import { ResourceManager } from "./engine/resources/ResourceManager.js";
import { LocalizationManager } from "./engine/localization/LocalizationManager.js";
import { AudioManager } from "./engine/audio/AudioManager.js";
import { WebAudioBackend } from "./engine/audio/WebAudioBackend.js";
import {
  MenuState,
  PlayingState,
  PauseState,
  LevelCompleteState,
  GameOverState,
  VictoryState,
} from "./game/states.js";
const canvas = document.querySelector("#game"),
  input = new InputManager(canvas),
  resources = new ResourceManager(),
  localization = new LocalizationManager(resources, "en"),
  renderer = new RenderManager(new CanvasRenderer()),
  audio = new AudioManager(new WebAudioBackend()),
  events = new EventBus();
const machine = new StateMachine({
  menu: new MenuState(),
  playing: new PlayingState(),
  paused: new PauseState(),
  levelcomplete: new LevelCompleteState(),
  gameover: new GameOverState(),
  victory: new VictoryState(),
});
const game = new Game({
  canvas,
  input,
  renderer,
  resources,
  localization,
  audio,
  events,
  stateMachine: machine,
});
game.statusLabel = () => {
  const keys = {
    menu: "status.ready",
    playing: "status.playing",
    paused: "status.paused",
    levelcomplete: "status.level",
    gameover: "status.gameover",
    victory: "status.victory",
  };
  document.querySelector("#status").textContent = localization.t(
    keys[machine.currentName] || "status.ready",
  );
};
game.onStateChanged = () => game.statusLabel();
game.toggleSound = () => {
  const on = audio.toggle();
  document.querySelector("#sound").textContent = localization.t(
    on ? "status.soundOn" : "status.soundOff",
  );
};
game.newRun = () => {
  game.world = null;
  game.system = null;
  game.newGamePending = true;
};
game.bindGameEvents = () => {
  game.unbindGameEvents();
  game.gameEventDisposers = [
    events.on("ball-launch", () => audio.play("start")),
    events.on("wall-hit", () => audio.play("wall-hit")),
    events.on("paddle-hit", () => audio.play("paddle-hit")),
    events.on("brick-hit", () => audio.play("paddle-hit")),
    events.on("power-up", () => audio.play("start")),
    events.on("life-lost", () => audio.play("game-over")),
  ];
};
game.unbindGameEvents = () => {
  for (const off of game.gameEventDisposers || []) off();
  game.gameEventDisposers = [];
};
localization.subscribe(() => {
  game.statusLabel();
  document.querySelector("#sound").textContent = localization.t(
    audio.enabled ? "status.soundOn" : "status.soundOff",
  );
  document.documentElement.lang = localization.locale;
});
document
  .querySelector("#language")
  .addEventListener("click", () => localization.toggle());
document
  .querySelector("#sound")
  .addEventListener("click", () => game.toggleSound());
await game.initialize();
machine.change("menu", game);
game.start();
window.addEventListener("beforeunload", () => input.destroy());
