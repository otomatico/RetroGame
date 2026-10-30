import { Game } from "./engine/Game.js";
import { EventBus } from "./engine/EventBus.js";
import { InputManager } from "./engine/input/InputManager.js";
import { CanvasRenderer } from "./engine/rendering/CanvasRenderer.js";
import { RenderManager } from "./engine/rendering/RenderManager.js";
import { ResourceManager } from "./engine/resources/ResourceManager.js";
import { LocalizationManager } from "./engine/localization/LocalizationManager.js";
import { AudioManager } from "./engine/audio/AudioManager.js";
º

const canvas = document.querySelector("#game"),
  input = new InputManager(canvas),
  resources = new ResourceManager(),
  localization = new LocalizationManager(resources, "en"),
  renderer = new RenderManager(new CanvasRenderer()),
  audio = new AudioManager(new WebAudioBackend()),
  events = new EventBus();
/*
await this.resources.loadManifest("./assets/manifest.json");
await this.localization.setLocale("es");
*/
// ==========================================
// 1. LOCALIZATION SYSTEM (Localization.md)
// ==========================================
/*
class LocalizationManager {

    toggleLocale() {
        this.currentLocale = this.currentLocale === "es" ? "en" : "es";
        this.updateUI();
    }

    updateUI() {
        document.getElementById("ui-title").innerText = this.t("title");
        document.getElementById("ui-lbl-score").innerText = this.t("score");
        document.getElementById("ui-lbl-highscore").innerText = this.t("highscore");
        document.getElementById("ui-boot-desc").innerText = this.t("bootDesc");
        document.getElementById("btn-start").innerText = this.t("startSys");
        document.getElementById("ui-pause-title").innerText = this.t("pausedTitle");
        document.getElementById("ui-pause-desc").innerText = this.t("pausedDesc");
        document.getElementById("btn-resume").innerText = this.t("resume");
        document.getElementById("ui-over-title").innerText = this.t("overTitle");
        document.getElementById("ui-over-desc").innerText = this.t("overDesc");
        document.getElementById("btn-restart").innerText = this.t("restartSys");
        document.getElementById("ui-hint-jump").innerText = this.t("hintJump");
        document.getElementById("ui-hint-pause").innerText = this.t("hintPause");

        const audioBtnLabel = document.getElementById("ui-audio-label");
        if (window.game && window.game.audio) {
            audioBtnLabel.innerText = window.game.audio.muted ? this.t("audioOff") : this.t("audioOn");
        }
    }
}
*/

// ==========================================
// 3. INPUT MANAGER (Input.md)
// ==========================================
class InputManager {
    constructor(canvas) {
        this.canvas = canvas;
        this.actions = {
            jumpPressed: false,
            pausePressed: false
        };

        this.jumpKeyHandled = false;
        this.pauseKeyHandled = false;

        window.addEventListener("keydown", (e) => {
            if (e.code === "Space") {
                e.preventDefault();
                if (!this.jumpKeyHandled) {
                    this.actions.jumpPressed = true;
                    this.jumpKeyHandled = true;
                }
            }
            if (e.code === "KeyP") {
                e.preventDefault();
                if (!this.pauseKeyHandled) {
                    this.actions.pausePressed = true;
                    this.pauseKeyHandled = true;
                }
            }
        });

        window.addEventListener("keyup", (e) => {
            if (e.code === "Space") this.jumpKeyHandled = false;
            if (e.code === "KeyP") this.pauseKeyHandled = false;
        });

        canvas.addEventListener("mousedown", (e) => {
            e.preventDefault();
            this.actions.jumpPressed = true;
        });

        canvas.addEventListener("touchstart", (e) => {
            e.preventDefault();
            this.actions.jumpPressed = true;
        }, { passive: false });
    }

    reset() {
        this.actions.jumpPressed = false;
        this.actions.pausePressed = false;
    }
}

// INICIALIZACIÓN DEL MOTOR
window.addEventListener("DOMContentLoaded", () => {
    window.game = new Game();
});