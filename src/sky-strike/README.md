# SKY / STRIKE — Vertical Shoot 'Em Up

Juego arcade de aviones con scroll vertical en **2D cenital puro**: sprites de tamaño fijo, fondo estelar que se desplaza, disparos, enemigos, power-ups y jefe final. Sin perspectiva ni proyección 2.5D.

## Ejecutar

Requiere un navegador moderno y servir los archivos mediante HTTP:

```bash
python -m http.server 8000
```

Abre `http://localhost:8000`.

## Controles

- `WASD` o flechas: mover el avión.
- Mantener `Espacio`: disparar.
- `X`: bomba inteligente que limpia enemigos y proyectiles hostiles.
- `P` o `Esc`: pausar/reanudar.
- `Enter`: empezar o volver a jugar.
- `R`: volver al menú.
- Botones superiores: sonido e idioma.

## Mecánicas

- Tres vidas iniciales, invulnerabilidad temporal tras recibir daño y pérdida de nivel de arma al ser alcanzado.
- Tres niveles de potencia de disparo.
- Power-ups de arma, escudo temporal, bomba y vida extra.
- Enemigos exploradores, cazas zigzag y nave pesada con barra de vida y disparos propios.
- Puntuación, cronómetro, efectos visuales, estados de pausa, derrota y victoria.

## Arquitectura

Se reutiliza la arquitectura modular documentada para el motor:

- `Game`: bucle con paso fijo.
- `StateMachine`: menú, juego, pausa, derrota y victoria.
- ECS genérico: `World`, `Transform`, `Velocity`, `Collider`, `Score` y componentes de juego en `src/game/components.js`.
- `ShootEmUpSystems`: simulación, spawns, colisiones, power-ups y render de juego.
- `InputManager`, `RenderManager`, `ResourceManager`, `LocalizationManager`, `AudioManager` y `EventBus`.
- Estilo `Retro Neon Minimal`: fondo azul-negro, acentos cian/magenta, glow moderado y scanlines.

## Verificación

La sintaxis JavaScript debe validarse con Node.js usando `node --check` para cada archivo `.js`. La experiencia final debe probarse en navegador para comprobar el balance de dificultad, colisiones y jefe.
