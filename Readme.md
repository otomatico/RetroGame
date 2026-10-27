# 🌍 Protocolo Global RetroGame (Fuente de Verdad)
Esta sección define las reglas invariables que se aplican a todos los juegos creados en este proyecto **RetroGame**.

### 1. Arquitectura de Estados
*   El flujo del juego está dictado por una Máquina de Estados Finita (**FSM**):
    `Boot` → `MainMenu` → `Playing` → `GameOver`.

### 2. Especificación Visual (Estética "Otomatico")
Todos los textos importantes deben seguir el patrón de **Aberración Cromática** (sombras Cyan y Magenta). El código de referencia es:

```javascript
render(text, x, y, size) {
    ctx.font = `bold ${size}px monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Shadow Magenta
    ctx.shadowColor = "magenta";
    ctx.shadowBlur = 15;
    ctx.fillStyle = "white";
    ctx.fillText(text, x + 3, y + 3);

    // Shadow Cyan
    ctx.shadowColor = "cyan";
    ctx.fillText(text, x - 3, y - 3);

    // Main Text
    ctx.shadowBlur = 0;
    ctx.fillStyle = "white";
    ctx.fillText(text, x, y);
}
```

#### A. Estado Boot
*   **Texto:** "Otomatico" centrado.
*   **Fondo:** Negro.
*   **Comportamiento:** Transición automática tras ~2 segundos.

#### B. Estado Menu
*   **Texto Principal:** Título del juego (ej: "Rompe Ladrillo" en la referencia base) centrado.
*   **Estilo:** Mismo patrón de sombra que Boot (Blanco + Cyan/Magenta).
*   **Texto Secundario ("Iniciar juego"):** 
    *   Posición: Abajo y centrado.
    *   Animación: `fadeON/fadeOFF` cada 500ms.

#### C. Estado Over
*   **Texto:** "Victory" o "You Loser".
*   **Posición:** Centrado.
*   **Estilo:** Blanco con sombras Cyan y Magenta sobre fondo negro.
