# Breakout — Retro Neon Minimal

Breakout modular con **5 niveles**, power-ups, puntuación, vidas, audio y localización. Ejemplo basado en la arquitectura del motor 2D documentada.

## Ejecutar

Desde esta carpeta, ejecuta `python -m http.server 8000` y abre `http://localhost:8000`. No requiere dependencias ni compilación. El navegador puede exigir una interacción para habilitar el audio.

## Controles
- **A/D** o **←/→**: mover la pala.
- **Ratón**: posicionar la pala.
- **Espacio / Enter**: empezar, lanzar o avanzar de nivel.
- **P / Escape**: pausa.
- **M**: sonido; **L**: idioma; **R**: volver a jugar tras el final.

## Power-ups
- **W**: pala ancha temporal.
- **S**: ralentizar la pelota temporalmente.
- **M**: multibola.
- **+**: vida extra.

## Arquitectura
`Game` coordina el bucle de paso fijo; `StateMachine` gestiona menú, juego, pausa, transición de nivel, derrota y victoria. `World` almacena entidades/componentes genéricos. `BreakoutSystem` contiene reglas específicas y emite eventos. Entrada, renderizado, recursos, localización y audio permanecen en servicios separados. La interfaz sigue la guía **Retro Neon Minimal**: fondo azul casi negro, cian y rosa neón, tipografía técnica, geometría simple y efectos discretos.

Los cinco patrones están definidos como datos en `src/game/levels.js`, para que sea fácil añadir niveles sin modificar el sistema de colisiones.
