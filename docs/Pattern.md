# Pattern - Abstraction

## 1. Objetivo

El objetivo de Pattern - Abstraction es identificar y formalizar los patrones comunes presentes en los juegos desarrollados, con el propósito de construir un motor reutilizable.

El motor debe proporcionar una estructura común para gestionar el ciclo de vida del juego, sus estados, la actualización de la simulación, el renderizado, las entradas y los recursos.

Cada juego debe poder definir sus propias reglas, mecánicas, niveles, entidades y presentación sin necesidad de modificar el núcleo del motor.

### 1.1. Principios de diseño

- **Reutilización:** los mecanismos comunes deben implementarse una sola vez.
- **Separación de responsabilidades:** cada módulo debe tener una función definida.
- **Extensibilidad:** añadir funcionalidades no debe requerir modificar innecesariamente los módulos existentes.
- **Independencia del juego:** el núcleo no debe contener reglas específicas de un juego concreto.
- **Composición:** los comportamientos deben poder construirse combinando módulos independientes.
- **Ciclo de vida explícito:** la inicialización, actualización, transición y finalización deben tener contratos definidos.
- **Configurabilidad:** los recursos, textos, controles y parámetros deben poder configurarse por juego.

## 2. Arquitectura general

El motor se organiza en los siguientes subsistemas:

| Subsistema | Responsabilidad | Documentación |
|---|---|---|
| Game | Coordinar el ciclo de vida del juego. | `pattern.md` |
| Game Loop | Coordinar las actualizaciones y el renderizado. | `pattern.md` |
| State Machine | Gestionar los estados y sus transiciones. | `pattern.md` |
| World / ECS | Administrar entidades, componentes y sistemas. | `ecs.md` |
| Input System | Recibir y distribuir las entradas del usuario. | `input.md` |
| Render System | Dibujar el mundo y la interfaz. | `rendering.md` |
| Resource Manager | Gestionar recursos y su ciclo de vida. | `resources.md` |
| Localization | Gestionar textos y traducciones. | `localization.md` |

Los documentos de los subsistemas desarrollan sus respectivos contratos. Este documento define cómo se relacionan con el núcleo del motor.

## 3. Game

`Game` representa la instancia principal de un juego.

Es responsable de coordinar los subsistemas y mantener la referencia al estado activo.

### 3.1. Responsabilidades

- Mantener la referencia al mundo activo.
- Registrar y gestionar los estados del juego.
- Realizar las transiciones entre estados.
- Ejecutar el bucle principal.
- Proporcionar acceso a los subsistemas compartidos.
- Gestionar la configuración general del juego.
- Coordinar el inicio y la detención del motor.

`Game` no debe implementar directamente las reglas de combate, movimiento, colisiones u otras mecánicas específicas.

### 3.2. Contrato de referencia

```javascript
class Game {
    constructor(config = {}) {
        this.config = config;

        this.world = null;
        this.currentState = null;
        this.currentStateId = null;

        this.states = new Map();

        this.running = false;
        this.lastTime = 0;
        this.rafId = null;
    }

    registerState(stateId, state) {
        this.states.set(stateId, state);
    }

    changeState(stateId) {
        const nextState = this.states.get(stateId);

        if (!nextState) {
            throw new Error(`Estado desconocido: ${stateId}`);
        }

        if (this.currentState) {
            this.currentState.exit();
        }

        this.currentState = nextState;
        this.currentStateId = stateId;

        this.currentState.init();
    }

    start() {
        // Iniciar el bucle del motor.
    }

    stop() {
        // Detener el bucle del motor.
    }

    loop(currentTime) {
        // Actualizar el estado activo y renderizar.
    }
}
```

Este código define el contrato conceptual de `Game`; la implementación definitiva del bucle se especifica en la sección siguiente.

La propiedad `world` representa el mundo utilizado por el estado activo. Su estructura y sus operaciones están definidas en `ecs.md`.

## 4. Game Loop

Todo juego utiliza un bucle principal que coordina la actualización y el renderizado.

El bucle debe permanecer independiente de las mecánicas específicas del juego y delegar el comportamiento en el estado activo.

### 4.1. Ciclo de ejecución

```text
Game Loop
    |
    v
Calcular delta time
    |
    v
Actualizar estado activo
    |
    v
Renderizar estado activo
    |
    v
Solicitar siguiente fotograma
    |
    +------> Game Loop
```

### 4.2. Contrato

Cada iteración debe:

1. Obtener el tiempo actual.
2. Calcular el tiempo transcurrido desde la iteración anterior.
3. Limitar los valores extremos de `delta time` según la política del motor.
4. Invocar `update(dt)` sobre el estado activo.
5. Invocar `render()` sobre el estado activo.
6. Programar la siguiente iteración mientras el motor permanezca activo.

### 4.3. Implementación de referencia

```javascript
loop(currentTime) {
    if (!this.running) return;

    const dt = this.lastTime === 0
        ? 0
        : Math.min(currentTime - this.lastTime, 16);

    this.lastTime = currentTime;

    this.currentState?.update(dt);
    this.currentState?.render();

    if (this.running) {
        this.rafId = requestAnimationFrame(
            this.loop.bind(this)
        );
    }
}
```

`requestAnimationFrame` sincroniza la ejecución con las oportunidades de renderizado del navegador, pero no garantiza una frecuencia constante de 60 FPS.

El límite de 16 ms evita que un fotograma lento provoque una actualización con un intervalo excesivo. Sin embargo, también descarta parte del tiempo transcurrido.

La implementación definitiva deberá establecer si el motor utiliza:

- **Delta variable:** cada actualización recibe el tiempo transcurrido desde el fotograma anterior.
- **Paso fijo:** la simulación avanza mediante intervalos constantes, mientras el renderizado puede ejecutarse a otra frecuencia.

Para simulaciones sensibles a la estabilidad temporal, se recomienda evaluar un paso fijo con acumulador.

## 5. State Machine

La máquina de estados controla las distintas fases del ciclo de vida del juego.

Cada estado encapsula su propia lógica de inicialización, actualización, renderizado y finalización.

### 5.1. Estados estándar

El motor proporciona los siguientes estados predeterminados:

| Estado | Descripción |
|---|---|
| `BOOT` | Inicialización y carga de recursos. |
| `MENU` | Menú principal y comienzo de la partida. |
| `PLAYING` | Ejecución de la simulación. |
| `PAUSE` | Suspensión de la simulación activa. |
| `OVER` | Finalización de la partida y presentación del resultado. |

Estos estados constituyen una configuración inicial, no una lista cerrada. Cada juego puede registrar estados adicionales.

### 5.2. Identificadores

```javascript
const STATE = Object.freeze({
    BOOT: "boot",
    MENU: "menu",
    PLAYING: "playing",
    PAUSE: "pause",
    OVER: "over"
});
```

Los identificadores son constantes para evitar errores tipográficos y facilitar la gestión de las transiciones.

### 5.3. Contrato de los estados

Todos los estados deben implementar el mismo contrato.

```javascript
class StateGame {
    constructor(game) {
        this.game = game;
    }

    init() {
        throw new Error("init() no implementado");
    }

    update(dt) {
        throw new Error("update() no implementado");
    }

    render() {
        throw new Error("render() no implementado");
    }

    exit() {
        // Limpieza opcional del estado.
    }
}
```

JavaScript no dispone de clases abstractas nativas. Los métodos que lanzan errores permiten detectar implementaciones incompletas cuando se invocan.

`exit()` permite liberar recursos temporales, cancelar suscripciones y detener procesos asociados al estado que deja de estar activo.

### 5.4. Ciclo de vida

El ciclo de vida de una transición es:

1. Validar que el estado de destino existe.
2. Invocar `exit()` en el estado actual, si existe.
3. Establecer el nuevo estado activo.
4. Invocar `init()` en el estado de destino.
5. Continuar el bucle principal utilizando el nuevo estado.

La implementación deberá definir qué sucede si `init()` falla, para evitar dejar el juego en un estado inconsistente.

### 5.5. Transiciones habituales

```text
BOOT
  |
  v
MENU <---------------- OVER
  |                      ^
  v                      |
PLAYING -----------------+
  |
  v
PAUSE
  |
  v
PLAYING
```

Las transiciones concretas dependen de las reglas del juego.

Ejemplos:

- `BOOT -> MENU`: inicialización completada.
- `MENU -> PLAYING`: el usuario comienza una partida.
- `PLAYING -> PAUSE`: el usuario pausa el juego.
- `PAUSE -> PLAYING`: el usuario reanuda la partida.
- `PLAYING -> OVER`: se cumple una condición de finalización.
- `OVER -> MENU`: el usuario vuelve al menú.

### 5.6. Responsabilidades del estado

Cada estado decide qué operaciones deben ejecutarse durante su actualización.

Por ejemplo:

- `BOOT` gestiona la inicialización.
- `MENU` procesa las entradas del menú y sus animaciones.
- `PLAYING` coordina los sistemas de la simulación.
- `PAUSE` gestiona la interfaz de pausa sin avanzar la simulación.
- `OVER` presenta el resultado y permite reiniciar o volver al menú.

El estado no debe duplicar las funcionalidades generales del motor.

## 6. Integración con World / ECS

El mundo y la arquitectura ECS se definen en el documento [`ecs.md`](ecs.md).

Este documento establece únicamente las reglas de integración con el motor.

### 6.1. Responsabilidades

- `Game` mantiene la referencia al mundo activo.
- `StateGame` proporciona acceso al juego mediante `this.game`.
- `StatePlay` coordina la ejecución de los sistemas del mundo.
- Los sistemas realizan las operaciones correspondientes a sus responsabilidades.
- Las reglas del juego determinan cómo reaccionar ante los eventos de la simulación.

### 6.2. Actualización del mundo

El estado `PLAYING` define el orden de actualización de los sistemas.

```javascript
class StatePlay extends StateGame {
    constructor(game) {
        super(game);

        this.systems = [];
    }

    init() {
        // Preparar la simulación.
    }

    update(dt) {
        const world = this.game.world;

        for (const system of this.systems) {
            system.update(world, dt);
        }

        // Aplicar las operaciones pendientes
        // en el punto definido por el motor.
    }

    render() {
        // Delegar el dibujo al renderizador.
    }
}
```

El ejemplo representa el flujo conceptual. El orden definitivo de los sistemas y la fase de aplicación de operaciones pendientes deben definirse en `ecs.md`.

### 6.3. Ciclo de vida del mundo

El motor debe distinguir entre:

- Cambiar de estado.
- Reiniciar una partida.
- Sustituir el mundo activo.
- Destruir entidades.
- Liberar recursos compartidos.

Cambiar de estado no implica automáticamente destruir el mundo.

Por ejemplo, al pasar a `OVER`, el juego puede conservar el mundo para mostrar estadísticas o una animación final. Al comenzar una partida nueva, puede crear otro mundo o reinicializar el existente.

La política de creación, reinicio y destrucción del mundo debe estar definida por el juego y por el contrato de `World`.

## 7. Entrada del usuario

La entrada debe gestionarse mediante un subsistema independiente.

Los estados no deben depender directamente de APIs concretas del navegador para detectar el teclado, el ratón o la pantalla táctil.

El `Input System` normaliza las entradas y proporciona una interfaz común.

Ejemplos de acciones:

- `confirm`
- `cancel`
- `pause`
- `moveLeft`
- `moveRight`
- `moveUp`
- `moveDown`

El estado activo decide cómo interpretar esas acciones.

La implementación detallada se especifica en `input.md`.

## 8. Renderizado

El renderizado se delega en un subsistema independiente.

El estado activo determina qué debe mostrarse, pero no debe implementar necesariamente los detalles de bajo nivel del dibujo.

El renderizador podrá encargarse de:

- Limpiar la superficie de dibujo.
- Dibujar el mundo.
- Dibujar sprites y animaciones.
- Dibujar texto e interfaz.
- Gestionar cámara, transformaciones y orden de dibujo.
- Adaptar la salida al tamaño de la superficie de renderizado.

El motor debe permitir separar el renderizado del mundo de la interfaz del estado actual.

La implementación detallada se especifica en `rendering.md`.

## 9. Recursos y localización

Los recursos compartidos deben gestionarse mediante servicios independientes.

### 9.1. Recursos

El `Resource Manager` puede administrar:

- Imágenes y sprites.
- Hojas de sprites.
- Audio.
- Fuentes.
- Datos de niveles.
- Configuración.

El motor debe distinguir entre recursos compartidos y recursos temporales de un estado.

Un cambio de estado no debe liberar un recurso compartido que todavía esté siendo utilizado por otro subsistema.

### 9.2. Localización

Los textos se almacenan fuera de la lógica de presentación.

Ejemplo:

```json
{
    "es": {
        "GameName": "Mi juego",
        "presskey": "Pulsa una tecla para continuar",
        "pause": "Pausa",
        "gameOver": "Fin de la partida"
    },
    "en": {
        "GameName": "My game",
        "presskey": "Press any key to continue",
        "pause": "Paused",
        "gameOver": "Game Over"
    }
}
```

El motor proporciona acceso a los textos correspondientes al idioma activo.

Los estados no deben contener traducciones duplicadas ni asumir que todos los juegos utilizan los mismos textos.

La implementación detallada se especifica en `localization.md`.

## 10. Extensibilidad

El motor debe permitir incorporar nuevos estados y subsistemas sin modificar las reglas de los estados existentes.

Para ello:

- Los estados se registran mediante identificadores.
- Los subsistemas se exponen mediante contratos estables.
- Las dependencias se proporcionan explícitamente.
- La configuración se separa de la implementación.
- Los juegos pueden definir sus propios sistemas y reglas.
- Los detalles de cada subsistema se mantienen en su documento específico.

El núcleo del motor no debe depender de clases concretas como `Player`, `Enemy`, `Tower`, `Snake` o `Projectile`.

## 11. Criterios de aceptación

La arquitectura se considerará implementada cuando:

1. El motor pueda iniciarse y detenerse de forma controlada.
2. El bucle principal invoque `update(dt)` y `render()` del estado activo.
3. Los estados cumplan el contrato común.
4. Las transiciones ejecuten correctamente `exit()` e `init()`.
5. Los estados puedan registrarse sin modificar la clase `Game`.
6. El estado `PAUSE` pueda suspender la simulación sin detener necesariamente el renderizado.
7. El mundo pueda conservarse o reinicializarse según las necesidades del juego.
8. La entrada, el renderizado, los recursos y la localización estén desacoplados de las reglas del juego.
9. El núcleo pueda reutilizarse en varios juegos sin introducir dependencias específicas de uno de ellos.
10. Cada subsistema tenga una especificación independiente que defina sus contratos y criterios de aceptación.

## 12. Documentación relacionada

- [`ecs.md`](ecs.md): entidades, componentes, sistemas, consultas, colisiones y operaciones pendientes.
- [`input.md`](input.md): abstracción y distribución de entradas.
- [`rendering.md`](rendering.md): renderizado del mundo y la interfaz.
- [`resources.md`](resources.md): carga, almacenamiento y liberación de recursos.
- [`localization.md`](localization.md): idiomas y textos del juego.