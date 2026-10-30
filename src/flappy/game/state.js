import { createWorld } from "./createWorld.js";
import { FlappySystemSystem } from "./FlappySystem.js";
import { Position,Velocity,Pipe,Player } from "./ecs/Components.js";
//import { *} from "./constants.js";
export const STATE = Object.freeze({
    BOOT: "boot",
    MENU: "menu",
    PLAYING: "playing",
    PAUSE: "pause",
    OVER: "over"
});

class StateBase {
    constructor(game) { this.game = game; }
    init() {}
    update(dt) {}
    render() {}
    exit() {}
}

export class StateBoot extends StateBase {
    init() {
        document.getElementById("overlay-boot").classList.remove("hidden");
    }
    exit() {
        document.getElementById("overlay-boot").classList.add("hidden");
    }
}

export class StateMenu extends StateBase {}

export class StatePause extends StateBase {
    init() {
        document.getElementById("overlay-pause").classList.remove("hidden");
    }
    exit() {
        document.getElementById("overlay-pause").classList.add("hidden");
    }
}

export class StateOver extends StateBase {
    init() {
        document.getElementById("final-score").innerText = this.game.score;
        document.getElementById("final-highscore").innerText = this.game.highscore;
        document.getElementById("overlay-over").classList.remove("hidden");
    }
    exit() {
        document.getElementById("overlay-over").classList.add("hidden");
    }
}

export class StatePlay extends StateBase {
    init() {
        this.game.resetGame();
    }

    update(dt) {
        const game = this.game;
        const world = game.world;

        // 1. GENERACIÓN DE OBSTÁCULOS / TUBERÍAS
        game.pipeSpawnTimer += dt;
        if (game.pipeSpawnTimer >= game.pipeSpawnInterval) {
            game.pipeSpawnTimer = 0;
            game.spawnPipe();
        }

        // 2. FÍSICAS DEL JUGADOR
        for (const { entityId, components } of world.query("Position", "Velocity", "Player")) {
            const [pos, vel, player] = components;

            // Input Impulso
            if (game.input.actions.jumpPressed) {
                vel.vy = game.jumpForce;
                game.audio.playJump();
            }

            // Aplicar Gravedad
            vel.vy += game.gravity * dt;
            pos.y += vel.vy * dt;

            // Límites Superior e Inferior
            if (pos.y - player.radius <= 0) {
                pos.y = player.radius;
                vel.vy = 0;
            }

            if (pos.y + player.radius >= game.canvas.height) {
                game.audio.playHit();
                game.changeState(STATE.OVER);
                return;
            }
        }

        // 3. MOVIMIENTO DE TUBERÍAS Y PUNTUACIÓN
        let playerPos = null;
        let playerComp = null;
        for (const { components } of world.query("Position", "Player")) {
            playerPos = components[0];
            playerComp = components[1];
        }

        for (const { entityId, components } of world.query("Position", "Velocity", "Pipe")) {
            const [pos, vel, pipe] = components;

            pos.x += vel.vx * dt;

            // Comprobar puntuación al sobrepasar tubería
            if (playerPos && !pipe.passed && pos.x + pipe.width < playerPos.x) {
                pipe.passed = true;
                game.score++;
                if (game.score > game.highscore) {
                    game.highscore = game.score;
                }
                game.audio.playScore();
                game.updateHUD();
            }

            // Destruir tuberías fuera de pantalla
            if (pos.x + pipe.width < 0) {
                world.queueDestroy(entityId);
            }

            // 4. DETECCIÓN DE COLISIONES (AABB vs Círculo / Jugador)
            if (playerPos && playerComp) {
                const px = playerPos.x;
                const py = playerPos.y;
                const pr = playerComp.radius;

                // Tubería Superior
                const topRect = { x: pos.x, y: 0, w: pipe.width, h: pipe.gapY };
                // Tubería Inferior
                const botRect = { x: pos.x, y: pipe.gapY + pipe.gapHeight, w: pipe.width, h: game.canvas.height - (pipe.gapY + pipe.gapHeight) };

                if (this.checkCircleRectCollision(px, py, pr, topRect) ||
                    this.checkCircleRectCollision(px, py, pr, botRect)) {
                    game.audio.playHit();
                    game.changeState(STATE.OVER);
                    return;
                }
            }
        }

        world.flushCommands();
    }

    checkCircleRectCollision(cx, cy, r, rect) {
        const closestX = Math.max(rect.x, Math.min(cx, rect.x + rect.w));
        const closestY = Math.max(rect.y, Math.min(cy, rect.y + rect.h));
        const dx = cx - closestX;
        const dy = cy - closestY;
        return (dx * dx + dy * dy) < (r * r);
    }

    render() {
        const game = this.game;
        const ctx = game.ctx;
        const world = game.world;

        // Limpiar fondo
        ctx.fillStyle = "#070B13";
        ctx.fillRect(0, 0, game.canvas.width, game.canvas.height);

        // Fondo Estilo Retro - Cuadrícula tenue
        ctx.strokeStyle = "rgba(37, 53, 75, 0.4)";
        ctx.lineWidth = 1;
        const gridSize = 30;
        for (let x = 0; x < game.canvas.width; x += gridSize) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, game.canvas.height);
            ctx.stroke();
        }
        for (let y = 0; y < game.canvas.height; y += gridSize) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(game.canvas.width, y);
            ctx.stroke();
        }

        // 1. DIBUJAR TUBERÍAS (Estructuras de Neón)
        for (const { components } of world.query("Position", "Pipe", "Renderable")) {
            const [pos, pipe, rend] = components;

            ctx.save();
            ctx.fillStyle = "#111827";
            ctx.strokeStyle = rend.color;
            ctx.lineWidth = 2;
            ctx.shadowColor = rend.color;
            ctx.shadowBlur = 8;

            // Tubería Superior
            ctx.fillRect(pos.x, 0, pipe.width, pipe.gapY);
            ctx.strokeRect(pos.x, 0, pipe.width, pipe.gapY);

            // Tubería Inferior
            const botY = pipe.gapY + pipe.gapHeight;
            const botH = game.canvas.height - botY;
            ctx.fillRect(pos.x, botY, pipe.width, botH);
            ctx.strokeRect(pos.x, botY, pipe.width, botH);

            // Bordes luminosos en los extremos de la abertura
            ctx.fillStyle = "#EEF5FF";
            ctx.fillRect(pos.x - 2, pipe.gapY - 4, pipe.width + 4, 4);
            ctx.fillRect(pos.x - 2, botY, pipe.width + 4, 4);

            ctx.restore();
        }

        // 2. DIBUJAR JUGADOR (Módulo Neon / Nave Geométrica)
        for (const { components } of world.query("Position", "Velocity", "Player", "Renderable")) {
            const [pos, vel, player, rend] = components;

            ctx.save();
            ctx.translate(pos.x, pos.y);

            // Rotación dinámica según velocidad vertical
            const angle = Math.min(Math.PI / 4, Math.max(-Math.PI / 4, vel.vy * 0.003));
            ctx.rotate(angle);

            ctx.shadowColor = rend.color;
            ctx.shadowBlur = 12;

            // Silueta Triangular Neón
            ctx.fillStyle = "#111827";
            ctx.strokeStyle = rend.color;
            ctx.lineWidth = 2;

            ctx.beginPath();
            ctx.moveTo(14, 0);
            ctx.lineTo(-10, -10);
            ctx.lineTo(-4, 0);
            ctx.lineTo(-10, 10);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();

            // Estela / Núcleo Central
            ctx.fillStyle = "#EEF5FF";
            ctx.beginPath();
            ctx.arc(0, 0, 3, 0, Math.PI * 2);
            ctx.fill();

            ctx.restore();
        }
    }
}