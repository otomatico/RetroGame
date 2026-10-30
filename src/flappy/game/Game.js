import { StateBoot,StateMenu,StatePause,StatePlay,StateOver,STATE } from "./state.js";

class Game {
    constructor() {
        this.canvas = document.getElementById("gameCanvas");
        this.ctx = this.canvas.getContext("2d");

        this.loc = new LocalizationManager();
        this.audio = new AudioManager();
        this.input = new InputManager(this.canvas);
        this.world = new World();

        this.currentStateId = null;
        this.states = new Map();

        // Parámetros de juego
        this.score = 0;
        this.highscore = 0;

        // Físicas y tuberías
        this.gravity = 900;
        this.jumpForce = -320;
        this.pipeSpeed = 160;
        this.pipeSpawnTimer = 0;
        this.pipeSpawnInterval = 1.6;

        this.initDOM();
        this.registerStates();
        this.changeState(STATE.BOOT);

        this.lastTime = 0;
        requestAnimationFrame((t) => this.loop(t));
    }

    registerStates() {
        this.states.set(STATE.BOOT, new StateBoot(this));
        this.states.set(STATE.MENU, new StateMenu(this));
        this.states.set(STATE.PLAYING, new StatePlay(this));
        this.states.set(STATE.PAUSE, new StatePause(this));
        this.states.set(STATE.OVER, new StateOver(this));
    }

    changeState(stateId) {
        if (this.currentState) {
            this.currentState.exit();
        }
        this.currentStateId = stateId;
        this.currentState = this.states.get(stateId);
        this.currentState.init();
    }

    initDOM() {
        document.getElementById("btn-lang").addEventListener("click", () => this.loc.toggleLocale());

        document.getElementById("btn-audio").addEventListener("click", () => {
            this.audio.init();
            const isMuted = this.audio.toggleMute();
            document.getElementById("ui-audio-label").innerText =
                isMuted ? this.loc.t("audioOff") : this.loc.t("audioOn");
        });

        document.getElementById("btn-pause").addEventListener("click", () => {
            if (this.currentStateId === STATE.PLAYING) {
                this.changeState(STATE.PAUSE);
            } else if (this.currentStateId === STATE.PAUSE) {
                this.changeState(STATE.PLAYING);
            }
        });

        document.getElementById("btn-start").addEventListener("click", () => {
            this.audio.init();
            this.changeState(STATE.PLAYING);
        });

        document.getElementById("btn-resume").addEventListener("click", () => {
            this.changeState(STATE.PLAYING);
        });

        document.getElementById("btn-restart").addEventListener("click", () => {
            this.changeState(STATE.PLAYING);
        });
    }

    resetGame() {
        this.world.clear();
        this.score = 0;
        this.pipeSpawnTimer = 0;
        this.updateHUD();

        // Crear jugador (Nave / Pájaro Neon)
        const player = this.world.createEntity();
        this.world.addComponent(player, "Position", new Component.Position(100, this.canvas.height / 2));
        this.world.addComponent(player, "Velocity", new Component.Velocity(0, 0));
        this.world.addComponent(player, "Player", new Component.Player());
        this.world.addComponent(player, "Renderable", new Component.Renderable("#63F4DC", "player"));
    }

    updateHUD() {
        document.getElementById("hud-score").innerText = this.score;
        document.getElementById("hud-highscore").innerText = this.highscore;
    }

    spawnPipe() {
        const gapHeight = 130;
        const minGapY = 80;
        const maxGapY = this.canvas.height - 80 - gapHeight;
        const gapY = Math.floor(Math.random() * (maxGapY - minGapY + 1)) + minGapY;
        const pipeWidth = 50;

        const pipe = this.world.createEntity();
        this.world.addComponent(pipe, "Position", new Component.Position(this.canvas.width, 0));
        this.world.addComponent(pipe, "Velocity", new Component.Velocity(-this.pipeSpeed, 0));
        this.world.addComponent(pipe, "Pipe", new Component.Pipe(pipeWidth, gapY, gapHeight));
        this.world.addComponent(pipe, "Renderable", new Component.Renderable("#FF648C", "pipe"));
    }

    loop(time) {
        const dt = this.lastTime === 0 ? 0 : Math.min((time - this.lastTime) / 1000, 0.1);
        this.lastTime = time;

        // Comprobar acción global de pausa por teclado
        if (this.input.actions.pausePressed) {
            if (this.currentStateId === STATE.PLAYING) {
                this.changeState(STATE.PAUSE);
            } else if (this.currentStateId === STATE.PAUSE) {
                this.changeState(STATE.PLAYING);
            }
        }

        if (this.currentState) {
            this.currentState.update(dt);
            this.currentState.render();
        }

        this.input.reset();
        requestAnimationFrame((t) => this.loop(t));
    }
}
