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
  PlayState,
  PauseState,
  GameOverState,
  VictoryState,
} from "./game/states.js";
const canvas = document.querySelector("#game"),
  input = new InputManager(window),
  resources = new ResourceManager(),
  localization = new LocalizationManager(resources, "en"),
  renderer = new RenderManager(new CanvasRenderer()),
  audio = new AudioManager(new WebAudioBackend()),
  events = new EventBus();
const states = new StateMachine({
  menu: new MenuState(),
  playing: new PlayState(),
  paused: new PauseState(),
  gameover: new GameOverState(),
  victory: new VictoryState(),
});
const game = new Game({
  input,
  renderer,
  resources,
  localization,
  audio,
  events,
  stateMachine: states,
  canvas,
});
game.statusLabel = () => {
  const labels = {
    menu: "READY",
    playing: "IN FLIGHT",
    paused: "PAUSED",
    gameover: "MISSION FAILED",
    victory: "SECTOR CLEARED",
  };
  document.querySelector("#status").textContent =
    labels[states.currentName] || "READY";
};
game.toggleSound = () => {
  const enabled = audio.toggle();
  audio.setMasterVolume(audio.masterVolume);
  document.querySelector("#sound").textContent = enabled
    ? "SOUND: ON"
    : "SOUND: OFF";
};
localization.subscribe(() => {
  game.statusLabel();
  document.documentElement.lang = localization.locale;
});
document
  .querySelector("#language")
  .addEventListener("click", () => localization.toggle());
document
  .querySelector("#sound")
  .addEventListener("click", () => game.toggleSound());
await game.initialize();
states.change("menu", game);
game.start();
window.addEventListener("beforeunload", () => input.destroy());
