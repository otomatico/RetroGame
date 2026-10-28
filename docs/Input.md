# Input System — Pattern & Abstraction

## 1. Objetivo

Definir un sistema de entrada reutilizable que permita a cualquier juego recibir y procesar acciones del usuario sin depender del dispositivo físico que las genera.

El sistema debe abstraer las diferencias entre teclado, ratón, mando y controles táctiles, proporcionando una interfaz común al resto del motor.

Por ejemplo, el juego debería poder consultar `moveLeft` sin conocer si el jugador ha pulsado la flecha izquierda, la tecla `A`, una cruceta virtual o el stick de un mando.

## 2. Principios de diseño

- **Abstracción:** el juego trabaja con acciones lógicas, no con teclas o botones físicos.
- **Independencia del dispositivo:** varios dispositivos pueden generar la misma acción.
- **Configurabilidad:** las asociaciones entre dispositivos y acciones pueden modificarse.
- **Separación de responsabilidades:** el sistema de entrada captura eventos y mantiene su estado; el juego decide qué hacer con ellos.
- **Consulta por estado:** permite saber si una acción está mantenida, acaba de activarse o acaba de finalizar.
- **Extensibilidad:** permite incorporar nuevos dispositivos sin modificar la lógica del juego.
- **Independencia del juego:** el sistema no contiene reglas específicas de un juego concreto.

## 3. Arquitectura

| Componente | Responsabilidad |
|---|---|
| `InputManager` | Coordina la captura de entradas y expone las acciones lógicas. |
| `InputDevice` | Abstracción de un dispositivo físico o virtual. |
| `KeyboardInput` | Traduce eventos de teclado. |
| `MouseInput` | Traduce eventos de ratón. |
| `GamepadInput` | Traduce entradas de mando. |
| `TouchInput` | Traduce gestos y controles táctiles. |
| `InputMapping` | Relaciona controles físicos con acciones lógicas. |
| `InputAction` | Representa una acción lógica del juego. |

Los dispositivos concretos son opcionales. Un juego que solo necesite teclado no tiene que implementar ni inicializar los demás.

## 4. Acciones lógicas

Las acciones representan intenciones del jugador, no controles físicos.

Ejemplos de acciones comunes:

- `moveLeft`
- `moveRight`
- `moveUp`
- `moveDown`
- `confirm`
- `cancel`
- `pause`
- `attack`
- `interact`

Estas acciones son ejemplos de configuración, no una lista obligatoria del motor. Cada juego define las que necesita.

Se recomienda que las acciones estén identificadas mediante cadenas o constantes para evitar dependencias con enumeraciones específicas de un juego.

## 5. Estados de una acción

El sistema debe distinguir tres situaciones:

| Estado | Significado |
|---|---|
| `isDown(action)` | La acción está activa en este momento. |
| `wasPressed(action)` | La acción se ha activado durante el último intervalo de actualización. |
| `wasReleased(action)` | La acción ha dejado de estar activa durante el último intervalo de actualización. |

Ejemplo de uso:

```js
if (input.isDown("moveLeft")) {
    player.moveLeft(dt);
}

if (input.wasPressed("attack")) {
    player.attack();
}

if (input.wasPressed("pause")) {
    game.changeState("PAUSE");
}
```

`isDown` resulta apropiado para acciones continuas, como el movimiento. `wasPressed` resulta apropiado para acciones puntuales, como atacar o confirmar una selección.

Los estados transitorios `wasPressed` y `wasReleased` deben conservarse durante el intervalo en el que se consultan y reiniciarse en un punto definido del ciclo de actualización. Así se evita perder eventos entre fotogramas o procesarlos varias veces por error.

## 6. Contrato de InputManager

El motor debe ofrecer una interfaz común, independientemente de la implementación interna.

```js
class InputManager {
    constructor() {
        this.devices = new Map();
        this.mappings = new Map();
    }

    registerDevice(id, device) {
        this.devices.set(id, device);
    }

    bind(action, control) {
        // Asocia un control físico o virtual a una acción.
    }

    isDown(action) {
        // Indica si la acción está activa.
    }

    wasPressed(action) {
        // Indica si la acción acaba de activarse.
    }

    wasReleased(action) {
        // Indica si la acción acaba de desactivarse.
    }

    getAxis(negativeAction, positiveAction) {
        // Devuelve -1, 0 o 1.
    }

    update(dt) {
        // Actualiza el estado lógico de las entradas.
    }

    reset() {
        // Limpia el estado de las entradas cuando corresponda.
    }
}
```

Este contrato es una referencia conceptual. Los métodos de registro, configuración y actualización pueden evolucionar sin cambiar la interfaz utilizada por los juegos.

## 7. Mapeo de controles

El mapeo separa los controles físicos de las acciones lógicas.

Ejemplo de configuración:

```js
const inputConfig = {
    moveLeft: [
        { device: "keyboard", code: "ArrowLeft" },
        { device: "keyboard", code: "KeyA" }
    ],

    moveRight: [
        { device: "keyboard", code: "ArrowRight" },
        { device: "keyboard", code: "KeyD" }
    ],

    confirm: [
        { device: "keyboard", code: "Enter" },
        { device: "keyboard", code: "Space" }
    ],

    pause: [
        { device: "keyboard", code: "Escape" }
    ]
};
```

Una acción estará activa si al menos uno de sus controles asociados se encuentra activo.

Si dos controles diferentes están asociados a la misma acción, soltar uno no debe desactivar la acción mientras el otro siga pulsado.

## 8. Integración con Game

`Game` posee o recibe una instancia de `InputManager` y la actualiza como parte del ciclo principal.

```js
class Game {
    constructor() {
        this.input = new InputManager();
        this.currentState = null;
    }

    update(dt) {
        this.input.update(dt);
        this.currentState?.update(dt);
    }
}
```

El orden definitivo de actualización debe estar documentado. Una opción sencilla es:

1. Capturar los eventos de entrada recibidos por los dispositivos.
2. Actualizar el estado lógico de las acciones.
3. Ejecutar la actualización del estado activo del juego.
4. Preparar el siguiente intervalo de entrada.

La implementación concreta puede necesitar separar la captura de eventos del procesamiento de acciones. Lo importante es que todos los estados sigan una política consistente.

## 9. Integración con los estados del juego

Los estados (`MENU`, `PLAYING`, `PAUSE`, `OVER`, etc.) consultan el mismo contrato de entrada, pero interpretan las acciones de manera diferente.

Por ejemplo:

- `MENU`: `moveUp`, `moveDown`, `confirm`.
- `PLAYING`: `moveLeft`, `moveRight`, `attack`, `interact`.
- `PAUSE`: `confirm`, `cancel`.
- `OVER`: `confirm`, `cancel`.

El `InputManager` no debe conocer estos estados ni decidir cómo se interpretan sus acciones.

Cada estado es responsable de consumir las acciones pertinentes y decidir si producen una transición o una operación del juego.

## 10. Ejes y entradas analógicas

Para movimientos bidimensionales, el motor puede proporcionar ejes lógicos.

```js
const horizontal = input.getAxis("moveLeft", "moveRight");
const vertical = input.getAxis("moveUp", "moveDown");
```

Cada eje devuelve:

- `-1`: dirección negativa.
- `0`: sin dirección.
- `1`: dirección positiva.

En un mando analógico, los ejes también pueden devolver valores continuos entre `-1` y `1`. Si se admite este comportamiento, conviene definir un contrato específico para ejes analógicos en lugar de asumir que todos son discretos.

Cuando se pulsan simultáneamente las dos acciones opuestas, el comportamiento debe estar definido. Para ejes digitales, una opción es que ambas se cancelen y el resultado sea `0`.

## 11. Ciclo de vida y situaciones especiales

El sistema debe establecer reglas explícitas para los siguientes casos:

- **Pérdida de foco:** evitar que una tecla quede registrada como pulsada al cambiar de ventana.
- **Pausa:** decidir si las entradas siguen capturándose y qué acciones están permitidas.
- **Cambio de estado:** evitar que una pulsación usada para confirmar una opción se interprete accidentalmente como una acción del siguiente estado.
- **Repetición del teclado:** diferenciar una tecla mantenida de los eventos de repetición que genera el sistema operativo.
- **Eventos duplicados:** evitar que un mismo evento físico active varias veces una acción puntual.
- **Controles virtuales:** permitir que la interfaz táctil produzca las mismas acciones lógicas que el teclado o el mando.

El método `reset()` debe tener un propósito definido. No debería borrar indiscriminadamente las entradas en cada fotograma, ya que podría perder pulsaciones o liberaciones que todavía necesitan consultarse.

## 12. Responsabilidades y límites

`InputManager` se encarga de:

- Capturar o recibir el estado de los dispositivos.
- Aplicar los mapeos.
- Calcular el estado de las acciones.
- Exponer consultas consistentes al juego.

`InputManager` no se encarga de:

- Mover directamente al jugador.
- Cambiar estados del juego por su cuenta.
- Ejecutar ataques o interacciones.
- Resolver colisiones.
- Decidir reglas de negocio del juego.
- Dibujar controles en pantalla.

La interfaz visual de controles táctiles, si existe, pertenece al sistema de interfaz o de presentación. Puede utilizar `InputManager` para comunicar sus acciones.

## 13. Criterios de aceptación

La implementación se considera válida cuando:

1. El juego puede consultar acciones lógicas sin conocer las teclas físicas.
2. Una acción admite más de un control asociado.
3. El sistema distingue acciones mantenidas, pulsaciones y liberaciones.
4. Los estados del juego pueden interpretar las acciones sin depender de dispositivos concretos.
5. Es posible añadir otro dispositivo sin modificar la lógica del juego.
6. La pérdida de foco no deja controles bloqueados.
7. El comportamiento de las acciones durante transiciones y pausas está definido.
8. Los ejes digitales tienen un comportamiento determinista.
9. Las entradas transitorias no se pierden ni se repiten accidentalmente entre actualizaciones.

## 14. Documentos relacionados

- `pattern.md`: arquitectura general, ciclo principal y máquina de estados.
- `ecs.md`: entidades, componentes, sistemas y operaciones del mundo.
- `rendering.md`: representación visual y dibujo.
- `resources.md`: carga y gestión de recursos.
