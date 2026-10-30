# NEON / RUSH — Vertical Highway

Juego arcade de conducción con **scroll vertical**, tráfico, power-ups y gestión de combustible. Mantiene la estética Retro Neon Minimal y la arquitectura modular del motor (Game, StateMachine, ECS, InputManager, RenderManager, ResourceManager, AudioManager, LocalizationManager y EventBus).

## Ejecutar

```bash
python -m http.server 8000
```

Abre `http://localhost:8000`.

## Controles

- `A / D` o `← / →`: conducir a izquierda/derecha.
- `W / ↑`: acelerar.
- `S / ↓`: frenar.
- `Espacio`: activar nitro.
- `P / Esc`: pausar.
- `Enter`: comenzar o volver a jugar.
- `R`: volver al menú.
- `M`: activar/desactivar sonido.
- `L`: cambiar idioma.

## Mecánicas

- Carretera de scroll vertical en 2D cenital puro: ancho constante, bordes paralelos y sin perspectiva ni escalado de sprites. Tráfico y colisiones.
- Combustible que disminuye con la distancia y afecta a la conducción cuando se agota.
- Gasolineras periódicas en el lateral de la carretera: frena, acércate al carril del surtidor y espera para repostar.
- Power-ups coleccionables: nitro, combustible, escudo temporal y puntos extra.
- Nitro limitado, puntuación, distancia, velocidad y cronómetro.
- Meta al completar 12 km.

## Arquitectura

```text
src/
  main.js
  engine/
    Game.js
    StateMachine.js
    EventBus.js
    ecs/                  # World y componentes genéricos
    input/                # InputManager
    rendering/            # RenderManager y CanvasRenderer
    resources/            # ResourceManager
    localization/         # LocalizationManager
    audio/                # AudioManager y backend Web Audio
  game/
    constants.js
    createWorld.js
    gameSystems.js        # scroll vertical, tráfico, pickups, combustible y dibujo
    states.js
assets/
  manifest.json
  locales/
```

La simulación específica del juego vive en `RacingSystems`; las entidades de coches usan el ECS genérico, mientras que los objetos temporales de carretera se representan como datos de juego gestionados por el sistema. El renderizado específico de la carretera se mantiene separado de la infraestructura genérica del motor.
