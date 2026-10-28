# Resource Manager — Pattern & Abstraction

## 1. Objetivo

Definir un sistema de gestión de recursos reutilizable que permita cargar, almacenar, consultar y liberar los recursos utilizados por un juego.

El sistema debe ocultar los detalles de acceso a archivos y formatos, ofreciendo una interfaz común para que los distintos sistemas del motor puedan utilizar imágenes, audio, fuentes, mapas, configuraciones y otros datos.

Por ejemplo, el sistema de renderizado debe poder solicitar una textura mediante una clave sin conocer su ruta física ni cómo se ha cargado.

## 2. Principios de diseño

- **Abstracción:** los sistemas solicitan recursos mediante una interfaz común.
- **Centralización:** la gestión del ciclo de vida de los recursos se concentra en un servicio.
- **Reutilización:** un recurso cargado puede ser compartido por múltiples entidades o sistemas.
- **Carga controlada:** el sistema define cuándo se cargan los recursos y cuándo están disponibles.
- **Independencia del formato:** los sistemas consumidores no necesitan conocer el proceso de lectura o decodificación.
- **Extensibilidad:** se pueden añadir nuevos tipos de recursos sin rediseñar el motor.
- **Gestión de errores:** los fallos de carga deben poder detectarse y diagnosticarse.
- **Propiedad explícita:** debe estar definido quién administra, comparte y libera cada recurso.
- **Independencia del juego:** el gestor no contiene reglas específicas de un juego concreto.

## 3. Arquitectura

| Componente | Responsabilidad |
|---|---|
| `ResourceManager` | Coordina el registro, la carga y el acceso a los recursos. |
| `ResourceLoader` | Carga un tipo concreto de recurso. |
| `ResourceHandle` | Representa una referencia estable a un recurso gestionado. |
| `ResourceCache` | Evita cargar varias veces un mismo recurso compatible. |
| `ResourceManifest` | Declara los recursos utilizados por el juego. |
| `ResourceGroup` | Agrupa recursos que comparten una fase de carga o un ciclo de vida. |

Estos componentes describen responsabilidades lógicas. Una implementación pequeña puede combinar algunos de ellos en una sola clase.

## 4. Tipos de recursos

El gestor puede administrar diferentes tipos de recursos:

| Tipo | Ejemplos | Consumidor habitual |
|---|---|---|
| Imagen o textura | PNG, JPEG, WebP | Rendering |
| Audio | WAV, OGG, MP3 | Audio System |
| Fuente | TTF, OTF, fuentes bitmap | Rendering / UI |
| Datos estructurados | JSON | Juego / sistemas |
| Mapas y niveles | JSON, formatos propios | World / Level Manager |
| Animaciones | Datos de frames y tiempos | Animation System |
| Shaders | GLSL u otros formatos | Rendering |
| Otros datos | Archivos binarios o formatos propios | Sistemas especializados |

No todos los recursos deben tratarse igual. Una imagen puede requerir decodificación, mientras que un archivo JSON necesita lectura y análisis sintáctico.

El gestor debe permitir asociar un cargador adecuado a cada tipo.

## 5. Identificación de recursos

Cada recurso debe disponer de una clave estable que permita solicitarlo sin depender directamente de su ubicación física.

Ejemplo:

```js
const texture = resources.get("sprites.player");
const level = resources.get("levels.forest");
const font = resources.get("fonts.pixel");
```

Las claves pueden declararse en un manifiesto:

```js
const resourceManifest = {
    "sprites.player": {
        type: "image",
        src: "assets/images/player.png"
    },

    "sprites.enemies": {
        type: "image",
        src: "assets/images/enemies.png"
    },

    "levels.forest": {
        type: "json",
        src: "assets/levels/forest.json"
    },

    "fonts.pixel": {
        type: "font",
        src: "assets/fonts/pixel.ttf"
    }
};
```

El manifiesto es una descripción de los recursos disponibles; no es necesario que el juego lo utilice si prefiere registrarlos mediante código o configuración.

Las claves deben ser únicas dentro del ámbito definido por el gestor. Si un recurso necesita distintas variantes de carga, estas deben diferenciarse mediante claves o configuraciones explícitas.

## 6. Contrato de ResourceManager

El motor debe ofrecer una interfaz común para registrar, cargar, consultar y liberar recursos.

```js
class ResourceManager {
    constructor(options = {}) {
        this.manifest = new Map();
        this.cache = new Map();
        this.loaders = new Map();

        this.options = options;
    }

    registerLoader(type, loader) {
        // Registra un cargador para un tipo de recurso.
    }

    register(key, definition) {
        // Registra una definición de recurso.
    }

    async load(key) {
        // Carga un recurso y devuelve su referencia.
    }

    async loadGroup(group) {
        // Carga los recursos de un grupo.
    }

    get(key) {
        // Obtiene un recurso que ya está disponible.
    }

    has(key) {
        // Comprueba si un recurso está registrado o disponible,
        // según el contrato documentado.
    }

    getStatus(key) {
        // Devuelve el estado de carga del recurso.
    }

    unload(key) {
        // Libera un recurso cuando ya no se necesita.
    }

    async unloadGroup(group) {
        // Libera los recursos administrados por un grupo.
    }

    clear() {
        // Libera los recursos gestionados por esta instancia.
    }
}
```

Este contrato es conceptual. La implementación puede modificar los métodos o dividir las responsabilidades en componentes independientes, siempre que mantenga una política clara de acceso y ciclo de vida.

## 7. Estados de carga

Cada recurso debe tener un estado identificable.

Se recomienda utilizar los siguientes estados:

| Estado | Significado |
|---|---|
| `registered` | El recurso está declarado, pero todavía no se ha solicitado su carga. |
| `loading` | La carga está en curso. |
| `loaded` | El recurso está disponible para su uso. |
| `error` | La última operación de carga ha fallado. |
| `unloaded` | El recurso no está cargado y puede volver a solicitarse. |

El sistema debe definir las transiciones válidas entre estos estados.

Una consulta mediante `get(key)` no debería iniciar una carga de forma implícita. Si el recurso no está disponible, debe devolver un resultado definido, como un error controlado o un valor que indique que todavía no está cargado.

Separar consulta y carga evita que un sistema de renderizado o una actualización de juego provoquen operaciones de E/S inesperadas.

## 8. Carga asíncrona

La carga puede implicar acceso al disco, red, decodificación o procesamiento de datos. Por ello, se recomienda ofrecer una API asíncrona.

```js
await resources.load("sprites.player");

const playerTexture = resources.get("sprites.player");
```

Para preparar un conjunto de recursos:

```js
await resources.loadGroup("main-menu");
```

Una vez completada la carga, los recursos del grupo deben estar disponibles según el contrato definido.

La implementación debe evitar duplicar cargas concurrentes del mismo recurso. Si varias partes del motor solicitan simultáneamente una misma clave, pueden compartir la misma operación de carga.

También se recomienda que los errores incluyan la clave del recurso y suficiente información para identificar el problema.

## 9. Caché y reutilización

El gestor debe mantener una caché de recursos cargados para evitar trabajo redundante.

Por ejemplo, varios sprites pueden utilizar la misma textura sin cargarla de nuevo cada vez.

La caché debe cumplir estas reglas:

1. Un mismo recurso compatible se carga una sola vez mientras la entrada correspondiente permanezca vigente.
2. Las solicitudes concurrentes de una misma clave comparten la carga en curso.
3. Las claves desconocidas generan un error controlado.
4. Un fallo de carga no debe dejar una entrada permanentemente bloqueada en estado `loading`.
5. La invalidación de caché debe definir qué ocurre con las referencias que ya están utilizando el recurso.

La caché no debe confundirse con la propiedad del recurso. Que un recurso esté almacenado en caché no significa necesariamente que pueda liberarse de forma segura en cualquier momento.

## 10. Referencias y propiedad

Los recursos pueden ser utilizados simultáneamente por distintos sistemas.

El gestor debe definir una política de propiedad para impedir que un consumidor libere un recurso que todavía necesita otro.

Se pueden utilizar dos enfoques:

### Enfoque A: propiedad centralizada

El `ResourceManager` mantiene los recursos durante toda la sesión o hasta que se libera un grupo completo.

Es sencillo y adecuado para juegos pequeños, especialmente si el consumo de memoria es moderado.

### Enfoque B: referencias compartidas

El gestor registra qué grupos o consumidores mantienen una referencia al recurso. Un recurso solo se libera cuando deja de ser necesario para todos ellos.

Es más flexible, pero requiere mayor complejidad de implementación.

La arquitectura inicial puede comenzar con propiedad centralizada y añadir referencias compartidas cuando el proyecto lo necesite.

Los consumidores no deben liberar directamente recursos internos del gestor salvo que el contrato de ese tipo de recurso lo permita expresamente.

## 11. Grupos de recursos

Los grupos permiten organizar recursos por fase, escena o funcionalidad.

Ejemplo:

```js
const groups = {
    boot: [
        "sprites.logo"
    ],

    mainMenu: [
        "sprites.menu-background",
        "fonts.pixel",
        "audio.menu-music"
    ],

    levelForest: [
        "sprites.player",
        "sprites.enemies",
        "levels.forest",
        "audio.forest-music"
    ]
};
```

El formato del ejemplo es ilustrativo; el manifiesto real debe definir cómo se relacionan las claves con los grupos.

Un grupo facilita:

- Preparar una pantalla antes de mostrarla.
- Cargar los recursos de un nivel antes de comenzar a jugar.
- Mostrar progreso durante cargas prolongadas.
- Liberar recursos que ya no se necesitan.
- Mantener separados los recursos compartidos y los exclusivos de una escena.

Los recursos comunes, como fuentes o interfaces, no deben liberarse mientras sigan siendo necesarios en otras escenas.

## 12. Integración con Game y los estados

`Game` proporciona acceso al `ResourceManager`, y los estados solicitan los recursos necesarios durante su preparación.

Ejemplo conceptual:

```js
class StateMenu {
    constructor(game) {
        this.game = game;
    }

    async init() {
        await this.game.resources.loadGroup("main-menu");
    }

    render() {
        const background =
            this.game.resources.get("sprites.menu-background");

        // El sistema de rendering utiliza el recurso disponible.
    }

    exit() {
        // Si corresponde, se libera el grupo exclusivo de este estado.
    }
}
```

Este ejemplo ilustra la integración, pero el ciclo de vida general del motor debe definir cómo se coordinan los estados asíncronos.

La arquitectura debe evitar que un estado se renderice utilizando recursos obligatorios que todavía no estén disponibles.

Si un cambio de estado inicia una carga asíncrona, también debe definirse qué sucede si se solicita otro cambio antes de que termine la operación.

## 13. Integración con otros sistemas

El gestor proporciona recursos; los sistemas especializados los utilizan.

| Sistema | Uso del Resource Manager |
|---|---|
| Rendering | Obtiene texturas, fuentes y recursos gráficos. |
| Audio | Obtiene recursos de sonido y música. |
| Localization | Carga los archivos de traducción. |
| Level Manager | Obtiene datos de mapas y niveles. |
| Animation System | Obtiene datos y hojas de sprites. |

El `ResourceManager` no debe contener la lógica propia de esos sistemas.

Por ejemplo, puede cargar un archivo de audio, pero no debe decidir cuándo reproducirlo. Puede cargar un mapa, pero no debe decidir cómo se comportan las entidades de ese mapa.

## 14. Progreso y errores de carga

Para juegos con recursos numerosos, conviene que el gestor permita conocer el progreso de una carga.

El contrato puede proporcionar información como:

- Recursos totales del grupo.
- Recursos cargados correctamente.
- Recursos que siguen cargándose.
- Recursos que han fallado.
- Porcentaje de progreso, cuando pueda calcularse de forma significativa.

El porcentaje debe tener una definición documentada. Contar recursos completados no equivale necesariamente a medir los bytes cargados.

Los errores deben ser visibles para el sistema que inició la operación. No se deben ignorar silenciosamente fallos de carga de recursos obligatorios.

Los recursos opcionales pueden tener una política diferente, como mostrar un elemento alternativo o continuar sin sonido.

## 15. Liberación de recursos

La liberación debe formar parte del ciclo de vida del motor.

El sistema debe definir:

- Cuándo puede liberarse un recurso.
- Qué grupos son propietarios de cada recurso.
- Cómo se manejan los recursos compartidos.
- Qué sucede con las referencias que todavía existen.
- Si el recurso puede cargarse de nuevo después de liberarse.

Los recursos que representan objetos gestionados por el navegador, como imágenes decodificadas o audio, pueden requerir procedimientos de liberación específicos. Estos detalles pertenecen al cargador correspondiente.

`clear()` debe utilizarse solo cuando se pretenda liberar todos los recursos administrados por esa instancia. No debe ejecutarse durante una transición normal si existen recursos que siguen siendo necesarios.

## 16. Seguridad y validación

El gestor debe validar las definiciones de recursos antes de utilizarlas.

Como mínimo:

1. Comprobar que la clave esté registrada.
2. Verificar que exista un cargador compatible con el tipo solicitado.
3. Validar la estructura de los datos recibidos cuando corresponda.
4. Manejar errores de lectura, decodificación y análisis.
5. Evitar que rutas o URL no autorizadas se introduzcan sin control si el juego admite recursos externos.
6. No ejecutar archivos de datos como código por el mero hecho de cargarlos.

En juegos web, las restricciones de origen, las políticas de seguridad y los permisos del navegador forman parte del entorno de ejecución y deben respetarse.

## 17. Criterios de aceptación

La implementación se considera válida cuando:

1. Los sistemas pueden solicitar recursos mediante claves estables.
2. Los cargadores se seleccionan según el tipo de recurso.
3. Los recursos tienen estados de carga identificables.
4. La carga asíncrona permite detectar errores.
5. Las solicitudes concurrentes no duplican innecesariamente una misma carga.
6. La caché reutiliza recursos compatibles.
7. La política de propiedad y liberación está documentada.
8. Los recursos pueden organizarse en grupos.
9. Los estados del juego no utilizan recursos obligatorios antes de que estén disponibles.
10. Los sistemas especializados no dependen de la implementación interna del gestor.
11. Los recursos pueden volver a cargarse después de ser liberados cuando el cargador lo permita.

## 18. Documentos relacionados

- `pattern.md`: arquitectura general, ciclo principal y máquina de estados.
- `input.md`: abstracción de dispositivos y acciones del usuario.
- `localization.md`: gestión de idiomas y traducciones.
- `rendering.md`: dibujo de imágenes, fuentes y elementos gráficos.
- `audio.md`: reproducción y gestión de audio, si se define como subsistema independiente.
- `ecs.md`: entidades, componentes, sistemas y operaciones del mundo.
