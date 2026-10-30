# Pong — ejemplo de arquitectura de motor 2D

Ejemplo jugable de Pong construido con JavaScript ES Modules y Canvas 2D. Su propósito es mostrar cómo colaboran las abstracciones documentadas:

- `Game` y bucle principal con `requestAnimationFrame`.
- Máquina de estados (`MenuState`, `PlayState`, `PauseState`, `GameOverState`).
- ECS genérico (`World`, componentes como datos y sistemas como comportamiento).
- Entrada lógica independiente del teclado (`InputManager`).
- Renderizado desacoplado mediante `RenderManager` y `CanvasRenderer`.
- Carga de recursos (`ResourceManager`) y manifiesto JSON.
- Localización por claves (`LocalizationManager`) con inglés/español.
- Audio desacoplado (`AudioManager`) con backend Web Audio.
- Eventos para comunicar sucesos de juego sin acoplar sistemas.

## Ejecutar

Por usar módulos ES, abre el proyecto con un servidor HTTP local desde esta carpeta:

```bash
python -m http.server 8000
```

Después visita `http://localhost:8000`.

No necesita dependencias ni compilación. El navegador puede exigir una primera interacción para habilitar audio.

## Controles

- **W / S** o **↑ / ↓**: mover la pala izquierda.
- **↑ / ↓**: mover la pala derecha en modo de dos jugadores.
- **Enter**: empezar / continuar.
- **P** o **Escape**: pausar.
- **R**: reiniciar después de terminar.
- **M**: activar/desactivar sonido.
- **L**: cambiar idioma.

La pala derecha se controla con flechas. Es un Pong local de dos jugadores; el objetivo es llegar a 7 puntos.

## Estructura

```text
index.html
src/
  main.js
  engine/
    Game.js
    StateMachine.js
    EventBus.js
    ecs/
      World.js
      components.js
      systems.js
    input/
      InputManager.js
    rendering/
      RenderManager.js
      CanvasRenderer.js
    resources/
      ResourceManager.js
    localization/
      LocalizationManager.js
    audio/
      AudioManager.js
      WebAudioBackend.js
  game/
    constants.js
    createWorld.js
    states.js
    gameSystems.js
assets/
  manifest.json
  locales/
    es.json
    en.json
```

## Decisiones de diseño

- `World` no conoce tipos concretos de componentes: almacena componentes por tipo y entidad.
- Los sistemas consultan los componentes que necesitan; no dibujan ni leen directamente el teclado.
- Los cambios estructurales del ECS se encolan y aplican al final de la actualización.
- `InputManager` traduce teclas a acciones lógicas (`leftUp`, `rightDown`, `confirm`, etc.).
- Los sistemas emiten eventos (`score`, `round-start`, `game-over`); la capa de juego reacciona a ellos.
- `RenderManager` delega el trabajo visual en un `Renderer`. El ejemplo implementa Canvas 2D.
- `ResourceManager` carga el manifiesto y los ficheros JSON de idioma. Las formas de Pong se dibujan primitivamente, por lo que no requieren sprites.
- `AudioManager` expone operaciones de alto nivel y delega los tonos en `WebAudioBackend`.
- El idioma se puede cambiar durante la partida sin recrear el mundo.

Este es un ejemplo educativo compacto, no un motor de producción. Las comprobaciones, herramientas de depuración, guardado, audio avanzado y pruebas automatizadas se podrían ampliar por separado.
