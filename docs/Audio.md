# Audio System — Pattern & Abstraction

## 1. Objetivo

Definir un sistema de audio reutilizable que permita reproducir y controlar sonidos y música sin acoplar la lógica del juego a una API específica de la plataforma.

El sistema debe proporcionar una interfaz común para cargar recursos de audio, reproducirlos, detenerlos, ajustar el volumen y administrar su ciclo de vida.

Por ejemplo, un estado del juego debe poder solicitar la reproducción de un efecto mediante una clave lógica, sin conocer cómo se decodifica el archivo ni cómo lo reproduce el navegador.

## 2. Principios de diseño

- **Abstracción:** la lógica del juego no depende de una API de audio concreta.
- **Separación de responsabilidades:** el sistema de audio reproduce sonidos; el juego decide cuándo deben reproducirse.
- **Independencia de plataforma:** se pueden incorporar diferentes backends de audio.
- **Integración con recursos:** los archivos de audio se gestionan mediante `ResourceManager`.
- **Control explícito:** reproducción, pausa, detención y volumen tienen un comportamiento definido.
- **Configurabilidad:** los volúmenes y las opciones de reproducción pueden modificarse.
- **Extensibilidad:** se pueden añadir canales, grupos y efectos de audio.
- **Gestión de errores:** los fallos de carga o reproducción deben poder diagnosticarse.
- **Independencia del juego:** el sistema no contiene reglas específicas de un juego concreto.

## 3. Arquitectura

| Componente | Responsabilidad |
|---|---|
| `AudioManager` | Coordina la reproducción y configura el sistema de audio. |
| `AudioBackend` | Define la interfaz de la tecnología de audio utilizada. |
| `WebAudioBackend` | Implementa la reproducción mediante Web Audio API. |
| `AudioClip` | Representa un recurso de audio cargado y preparado para reproducirse. |
| `AudioSource` | Representa una instancia de reproducción con su propio estado. |
| `AudioChannel` | Agrupa reproducciones que comparten controles de volumen u otras opciones. |
| `AudioGroup` | Organiza sonidos por función, como música, interfaz o efectos. |

Estos componentes representan responsabilidades lógicas. Para una primera versión, `AudioManager`, `AudioBackend` y las estructuras de reproducción pueden ser suficientes.

`WebAudioBackend` es una implementación inicial adecuada para un juego HTML5, pero no debe ser una dependencia del contrato general.

## 4. Tipos de audio

El sistema debe distinguir, como mínimo, entre música y efectos de sonido.

| Tipo | Ejemplos | Comportamiento habitual |
|---|---|---|
| Música | Menú, exploración, combate | Reproducción prolongada, bucle opcional y transiciones. |
| Efectos | Saltos, impactos, explosiones | Reproducciones cortas, potencialmente simultáneas. |
| Interfaz | Confirmar, cancelar, navegar | Respuesta inmediata a las acciones del usuario. |
| Ambiente | Viento, lluvia, sonidos de fondo | Reproducción continua o en bucle. |
| Voz | Diálogos y narración | Reproducción controlada y posible sincronización. |

La clasificación sirve para organizar el audio, no para imponer comportamientos rígidos. Por ejemplo, un sonido ambiental puede utilizar las mismas capacidades técnicas que una música en bucle.

## 5. Identificación de recursos

Los recursos de audio deben identificarse mediante claves estables.

Ejemplos:

- `audio.music.menu`
- `audio.music.level1`
- `audio.sfx.jump`
- `audio.sfx.hit`
- `audio.ui.confirm`
- `audio.ambient.forest`

Los consumidores utilizan esas claves en lugar de rutas físicas.

Ejemplo de manifiesto:

```js
const audioManifest = {
    "audio.music.menu": {
        type: "audio",
        src: "assets/audio/menu.ogg",
        group: "music"
    },

    "audio.sfx.jump": {
        type: "audio",
        src: "assets/audio/jump.wav",
        group: "sfx"
    },

    "audio.ui.confirm": {
        type: "audio",
        src: "assets/audio/confirm.wav",
        group: "ui"
    }
};
```

El manifiesto es ilustrativo. Las definiciones reales pueden formar parte del manifiesto general de `resources.md`.

El `AudioManager` no debe convertirse en un segundo gestor de archivos: obtiene los recursos de audio a través de `ResourceManager` o de la abstracción de recursos definida por el motor.

## 6. Contrato de AudioManager

El motor debe ofrecer una interfaz común para reproducir y controlar el audio.

```js
class AudioManager {
    constructor(options = {}) {
        this.backend = null;
        this.masterVolume = 1;
        this.muted = false;

        this.channels = new Map();
        this.sources = new Map();
    }

    async initialize() {
        // Inicializa el backend de audio.
    }

    async play(key, options = {}) {
        // Reproduce un recurso y devuelve una referencia
        // a la instancia de reproducción.
    }

    stop(source) {
        // Detiene una reproducción concreta.
    }

    pause(source) {
        // Pausa una reproducción concreta.
    }

    resume(source) {
        // Reanuda una reproducción pausada.
    }

    stopAll() {
        // Detiene todas las reproducciones administradas.
    }

    setMasterVolume(value) {
        // Establece el volumen general.
    }

    setMuted(muted) {
        // Activa o desactiva el silencio global.
    }

    createChannel(name, options = {}) {
        // Crea o registra un canal de audio.
    }

    update(dt) {
        // Actualiza estados que requieran coordinación del motor.
    }

    dispose() {
        // Libera los recursos propios del sistema de audio.
    }
}
```

Este contrato es conceptual. La implementación puede ajustar la firma de los métodos, especialmente si la reproducción devuelve una promesa o si el backend gestiona los estados de forma asíncrona.

La interfaz debe documentar qué operaciones son síncronas y cuáles pueden fallar por restricciones de la plataforma.

## 7. Reproducción de audio

Los estados y sistemas solicitan la reproducción mediante claves.

```js
audio.play("audio.sfx.jump");
```

Para reproducir música en bucle:

```js
audio.play("audio.music.level1", {
    loop: true,
    volume: 0.7,
    channel: "music"
});
```

Para un efecto que no debe solaparse consigo mismo, el juego puede utilizar una opción de exclusión o administrar una referencia a la reproducción actual.

El comportamiento predeterminado debe estar documentado. Se recomienda que los efectos de sonido puedan solaparse, mientras que la música se controle explícitamente por canal.

La reproducción no debe modificar las reglas del juego ni bloquear el ciclo principal mientras se carga o decodifica un recurso.

## 8. Instancias de reproducción

Un mismo recurso puede reproducirse varias veces de forma simultánea.

Por ejemplo, varias entidades pueden generar el mismo sonido de impacto durante un combate.

Por este motivo, el recurso de audio y la instancia de reproducción deben ser conceptos distintos:

- `AudioClip`: representa el contenido reutilizable.
- `AudioSource`: representa una reproducción concreta.

Una instancia de reproducción puede incluir:

- Identificador.
- Recurso utilizado.
- Estado actual.
- Volumen local.
- Canal asignado.
- Configuración de bucle.
- Tiempo de reproducción, si está disponible.
- Referencia interna del backend.

El juego no debe depender de los objetos internos de Web Audio API. Debe recibir una referencia estable que le permita controlar la reproducción mediante el contrato del motor.

## 9. Canales y grupos de audio

Los canales permiten controlar varias reproducciones mediante un mismo control.

Se recomienda definir, como mínimo:

- `master`: volumen general.
- `music`: música.
- `sfx`: efectos.
- `ui`: sonidos de interfaz.
- `ambient`: sonido ambiental.
- `voice`: voz, si el juego la utiliza.

El volumen efectivo puede calcularse como:

\[
V_{\text{efectivo}} =
V_{\text{master}}
\cdot V_{\text{canal}}
\cdot V_{\text{fuente}}
\]

Todos los volúmenes deben normalizarse al intervalo de \(0\) a \(1\), salvo que la API pública defina expresamente otra convención.

Ejemplo:

```js
audio.setMasterVolume(0.8);
audio.setChannelVolume("music", 0.5);
audio.setChannelVolume("sfx", 1.0);
```

Los nombres y los valores son configurables. Un juego puede utilizar menos canales o añadir otros específicos.

Los grupos organizan recursos; los canales controlan reproducciones. Aunque ambos pueden compartir nombres, no son el mismo concepto.

## 10. Ciclo de vida de la reproducción

Una instancia de audio debe tener estados claramente definidos.

| Estado | Significado |
|---|---|
| `idle` | La instancia existe, pero no está reproduciendo. |
| `playing` | La reproducción está activa. |
| `paused` | La reproducción está pausada. |
| `stopped` | La reproducción se ha detenido. |
| `ended` | La reproducción ha terminado de forma natural. |
| `error` | La reproducción ha fallado. |

La implementación puede simplificar estos estados si el backend no necesita todos ellos, pero debe definir las diferencias entre pausar y detener.

- **Pausar:** conserva la posibilidad de continuar desde la posición pausada, cuando el backend lo permita.
- **Detener:** finaliza la reproducción actual.
- **Finalizar:** indica que el sonido ha terminado de forma natural.

Algunas plataformas no permiten reanudar una instancia detenida. En esos casos, el juego debe crear una nueva instancia de reproducción.

## 11. Música y transiciones

El sistema debe permitir reproducir música de fondo y sustituirla cuando cambie el contexto del juego.

Ejemplo:

```js
const music = await audio.play("audio.music.menu", {
    loop: true,
    channel: "music"
});

// Cuando el juego comienza:
audio.stop(music);

await audio.play("audio.music.level1", {
    loop: true,
    channel: "music"
});
```

El código es ilustrativo: la política de sustitución puede gestionarse mediante una operación específica de música.

Para evitar cortes bruscos, el sistema puede incorporar transiciones graduales de volumen (*fade-in* y *fade-out*).

La API debe definir si iniciar una nueva música detiene automáticamente la anterior o si ambas pueden coexistir. Se recomienda no imponer esta decisión a todos los canales: la política de exclusividad debe configurarse por canal o mediante una operación explícita.

## 12. Integración con Game y los estados

`Game` proporciona acceso al sistema de audio.

Los estados deciden qué sonidos reproducir, pero no administran directamente el backend.

Ejemplo conceptual:

```js
class StateMenu {
    constructor(game) {
        this.game = game;
    }

    init() {
        this.game.audio.play("audio.music.menu", {
            loop: true,
            channel: "music"
        });
    }

    update(dt) {
        // Procesa la lógica del menú.
    }

    exit() {
        // Solicita detener o cambiar la música si corresponde.
    }
}
```

El ciclo de vida del estado debe definir quién controla la música al entrar y salir.

No todos los cambios de estado deben detener automáticamente todo el audio. Por ejemplo, abrir una pausa puede mantener la música, mientras que cambiar de nivel puede sustituirla.

Estas decisiones pertenecen a las reglas del juego o a una política de audio configurable, no al backend.

## 13. Integración con InputManager

Las entradas del usuario pueden provocar operaciones de audio, pero el sistema de entrada no debe reproducir sonidos directamente.

Ejemplo:

```js
if (input.wasPressed("confirm")) {
    audio.play("audio.ui.confirm");
}
```

La responsabilidad queda separada:

- `InputManager` detecta la acción.
- El estado interpreta la acción.
- `AudioManager` ejecuta la reproducción solicitada.

Esta separación permite cambiar los controles sin modificar el comportamiento del audio.

## 14. Restricciones de plataformas web

En navegadores, la reproducción de audio puede estar sujeta a políticas de reproducción automática.

Por tanto, el sistema debe contemplar:

- Inicialización del contexto de audio.
- Activación tras una interacción válida del usuario cuando sea necesaria.
- Recursos todavía no cargados o no decodificados.
- Suspensión y reanudación del contexto.
- Pérdida de foco o cambios de visibilidad de la página.
- Errores al iniciar la reproducción.

El motor debe exponer un estado de disponibilidad del audio si la plataforma lo necesita.

No debe asumir que una llamada a `play()` siempre produce sonido inmediatamente. Si la reproducción está bloqueada por el navegador, debe poder notificarse o reintentarse mediante un flujo explícito y compatible con la plataforma.

La lógica del juego no debe quedar bloqueada por estas restricciones.

## 15. Gestión de recursos y memoria

El sistema de audio utiliza recursos administrados por `ResourceManager`.

El gestor de recursos se encarga de cargar y mantener el contenido reutilizable. El sistema de audio se encarga de crear, controlar y finalizar las instancias de reproducción.

Se recomienda:

1. Reutilizar recursos decodificados cuando sea apropiado.
2. Evitar crear instancias ilimitadas de efectos repetidos.
3. Establecer un límite configurable de voces simultáneas si el juego lo necesita.
4. Definir qué sucede cuando se supera ese límite.
5. Liberar referencias a reproducciones finalizadas.
6. Liberar los recursos internos del backend cuando dejan de ser necesarios.

El límite de voces puede aplicarse por recurso, canal o globalmente. La política debe ser configurable y determinista, por ejemplo, rechazando una nueva reproducción o reemplazando una instancia seleccionada según una regla explícita.

## 16. Volumen, silencio y preferencias

El sistema debe admitir controles independientes para volumen general y canales.

Ejemplo de preferencias:

```js
const audioSettings = {
    masterVolume: 0.8,
    musicVolume: 0.6,
    sfxVolume: 1.0,
    muted: false
};
```

La interfaz de configuración debe modificar estas preferencias a través de la API pública del sistema.

El almacenamiento persistente de preferencias pertenece al sistema de configuración o persistencia del motor, no necesariamente al `AudioManager`.

El sistema debe definir cómo se combinan el silencio global, el volumen del canal y el volumen individual de una reproducción.

## 17. Responsabilidades y límites

`AudioManager` se encarga de:

- Coordinar la reproducción.
- Gestionar canales y volumen.
- Exponer operaciones de control de audio.
- Mantener referencias a instancias de reproducción.
- Gestionar errores de reproducción y disponibilidad del backend.

`AudioBackend` se encarga de:

- Interactuar con la API de audio concreta.
- Ejecutar las operaciones de reproducción.
- Administrar las particularidades de la plataforma.

`ResourceManager` se encarga de:

- Cargar y mantener los recursos de audio.
- Gestionar la caché y el ciclo de vida del contenido.

El sistema de audio no se encarga de:

- Decidir las reglas del juego.
- Detectar las acciones físicas del usuario.
- Dibujar la interfaz.
- Traducir textos.
- Resolver colisiones.
- Decidir por sí solo qué música corresponde a cada nivel.

## 18. Criterios de aceptación

La implementación se considera válida cuando:

1. Los sonidos se solicitan mediante claves estables.
2. La reproducción está desacoplada de la API concreta de audio.
3. Música y efectos pueden gestionarse de forma independiente.
4. Las reproducciones simultáneas están soportadas según una política definida.
5. Existen controles para volumen general, canales y silencio.
6. Las instancias de reproducción tienen un ciclo de vida documentado.
7. Los errores y las restricciones de la plataforma pueden diagnosticarse.
8. El sistema utiliza `ResourceManager` para acceder a los recursos.
9. Los cambios de estado del juego no detienen automáticamente audio que deba continuar.
10. La memoria y las reproducciones activas se gestionan de forma controlada.
11. Las restricciones de reproducción automática del navegador están contempladas.
12. La lógica del juego no depende de los objetos internos del backend.

## 19. Documentos relacionados

- `pattern.md`: arquitectura general, ciclo principal y máquina de estados.
- `resources.md`: carga, caché y ciclo de vida de los recursos.
- `input.md`: dispositivos y acciones lógicas.
- `rendering.md`: representación visual.
- `localization.md`: traducciones y selección de idioma.
- `ecs.md`: entidades, componentes, sistemas y operaciones del mundo.
