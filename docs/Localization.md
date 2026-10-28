# Localization System — Pattern & Abstraction

## 1. Objetivo

Definir un sistema de localización reutilizable que permita mostrar textos en diferentes idiomas sin acoplar el código del juego a un idioma concreto.

El sistema debe centralizar los textos traducibles, permitir seleccionar el idioma activo y proporcionar una interfaz común para consultar traducciones desde cualquier parte del juego.

Por ejemplo, un menú debe solicitar la clave `menu.start` en lugar de contener directamente el texto `"Start Game"`.

## 2. Principios de diseño

- **Abstracción:** el código utiliza claves de traducción, no textos literales dependientes del idioma.
- **Independencia del juego:** el sistema no contiene textos específicos de un juego.
- **Separación de responsabilidades:** la localización administra traducciones; la interfaz decide cómo mostrarlas.
- **Configurabilidad:** el idioma inicial se establece mediante la configuración del juego.
- **Extensibilidad:** se pueden añadir idiomas sin modificar los sistemas que consultan las traducciones.
- **Fallback:** si una traducción no existe, se aplica una política de recuperación definida.
- **Formato externo:** las traducciones se almacenan en archivos independientes del código.
- **Compatibilidad Unicode:** los textos deben admitir caracteres acentuados y alfabetos compatibles con Unicode.

## 3. Arquitectura

| Componente | Responsabilidad |
|---|---|
| `LocalizationManager` | Coordina el idioma activo y las consultas de traducción. |
| `LocaleProvider` | Carga y proporciona los recursos de un idioma. |
| `LocaleResource` | Representa el conjunto de traducciones de un idioma. |
| `LocalizationFormatter` | Interpola parámetros y procesa mensajes con variables. |
| `LocaleResolver` | Determina qué traducción debe utilizarse cuando falta una clave. |

Estos componentes describen responsabilidades lógicas. No es obligatorio implementarlos como clases independientes si una implementación más sencilla puede mantener las mismas responsabilidades.

## 4. Claves de traducción

Cada texto traducible debe identificarse mediante una clave estable, independiente de su contenido.

Se recomienda utilizar claves jerárquicas separadas por puntos.

Ejemplos:

- `game.title`
- `menu.start`
- `menu.options`
- `menu.exit`
- `pause.title`
- `pause.resume`
- `gameover.title`
- `gameover.retry`
- `settings.language`
- `settings.audio`

Las claves deben describir la función del texto, no su traducción literal.

Correcto:

```js
localization.t("menu.start");
```

No recomendado:

```js
localization.t("Iniciar partida");
```

Las claves forman parte del contrato interno del juego. Cambiarlas requiere actualizar las referencias que las utilizan.

## 5. Organización de archivos

Las traducciones se almacenarán en archivos independientes, preferiblemente JSON.

Estructura propuesta:

```text
assets/
└── localization/
    ├── es.json
    ├── en.json
    └── fr.json
```

Cada archivo representa un idioma e incluye las mismas claves lógicas.

Ejemplo de `es.json`:

```json
{
  "game": {
    "title": "Mi juego"
  },
  "menu": {
    "start": "Iniciar partida",
    "options": "Opciones",
    "exit": "Salir"
  },
  "pause": {
    "title": "Pausa",
    "resume": "Continuar"
  },
  "gameover": {
    "title": "Fin de la partida",
    "retry": "Volver a jugar"
  },
  "settings": {
    "language": "Idioma"
  }
}
```

Ejemplo de `en.json`:

```json
{
  "game": {
    "title": "My Game"
  },
  "menu": {
    "start": "Start Game",
    "options": "Options",
    "exit": "Exit"
  },
  "pause": {
    "title": "Paused",
    "resume": "Resume"
  },
  "gameover": {
    "title": "Game Over",
    "retry": "Play Again"
  },
  "settings": {
    "language": "Language"
  }
}
```

Las claves de ambos archivos deben mantenerse alineadas. Las diferencias entre idiomas son los valores traducidos, no la estructura lógica de las claves.

## 6. Contrato de LocalizationManager

El motor debe ofrecer una interfaz común para consultar traducciones y cambiar de idioma.

```js
class LocalizationManager {
    constructor(options = {}) {
        this.defaultLocale = options.defaultLocale ?? "en";
        this.currentLocale = this.defaultLocale;
        this.fallbackLocale = options.fallbackLocale ?? this.defaultLocale;

        this.resources = new Map();
    }

    async loadLocale(locale) {
        // Carga y registra los recursos del idioma.
    }

    async setLocale(locale) {
        // Activa un idioma previamente cargado o lo carga.
    }

    getLocale() {
        return this.currentLocale;
    }

    t(key, params = {}) {
        // Devuelve la traducción de una clave.
    }

    has(key, locale = this.currentLocale) {
        // Indica si existe una traducción para la clave.
    }

    getAvailableLocales() {
        // Devuelve los idiomas disponibles.
    }
}
```

Este contrato es conceptual. La implementación puede variar según la plataforma y el mecanismo de carga de recursos.

### Consideraciones

- `loadLocale()` debe informar de errores de carga o de formato.
- `setLocale()` debe definir qué ocurre si el idioma solicitado no existe.
- `t()` debe ser una operación síncrona cuando los recursos ya estén cargados.
- Los recursos de un idioma deben estar disponibles antes de activar ese idioma.
- Los cambios de idioma deben aplicarse de forma consistente a las siguientes consultas.

## 7. Consulta de traducciones

Los estados y sistemas consultan el servicio mediante claves.

```js
const title = localization.t("game.title");
const startLabel = localization.t("menu.start");
```

La lógica del menú no necesita conocer el idioma actual ni seleccionar manualmente el archivo correspondiente.

Ejemplo conceptual de un estado:

```js
class StateMenu {
    constructor(game) {
        this.game = game;
    }

    render() {
        const localization = this.game.localization;

        this.drawText(
            localization.t("menu.start"),
            20,
            10
        );
    }
}
```

El método `drawText()` es ilustrativo y pertenece al sistema de presentación, no al de localización.

## 8. Parámetros dinámicos

Algunos mensajes contienen información variable, como una puntuación, el nombre de un jugador o el número de vidas restantes.

El sistema debe permitir interpolar parámetros sin construir cada frase manualmente.

Ejemplo de traducción:

```json
{
  "game": {
    "welcome": "¡Bienvenido, {player}!",
    "score": "Puntuación: {score}"
  }
}
```

Uso:

```js
localization.t("game.welcome", {
    player: "Alex"
});

localization.t("game.score", {
    score: 1250
});
```

Resultado:

```text
¡Bienvenido, Alex!
Puntuación: 1250
```

Las reglas de interpolación deben estar documentadas. Como mínimo, se recomienda:

- Sustituir únicamente los parámetros declarados.
- No ejecutar el contenido de los parámetros como código.
- Definir qué ocurre cuando falta un parámetro.
- Evitar sustituir accidentalmente texto que no sea un marcador válido.

## 9. Idioma predeterminado y fallback

El sistema debe definir una política para las claves que no estén disponibles en el idioma activo.

Orden recomendado:

1. Buscar la clave en el idioma activo.
2. Si no existe, buscarla en el idioma de fallback.
3. Si tampoco existe, devolver un resultado de diagnóstico definido por la implementación.

Ejemplo:

```js
localization.t("menu.start");
```

Si `menu.start` no existe en español, pero sí en inglés, se utilizará el valor inglés.

Para facilitar el desarrollo, se recomienda que las claves ausentes generen advertencias en modo de desarrollo. En producción, el comportamiento debe ser controlado y no interrumpir la ejecución del juego.

El idioma de fallback y el idioma predeterminado no tienen por qué ser conceptos distintos, aunque se recomienda mantener ambas opciones configurables.

## 10. Cambio de idioma durante la ejecución

El sistema debe permitir cambiar el idioma sin reiniciar el juego.

Ejemplo:

```js
await localization.setLocale("es");
```

Una vez completado el cambio, las siguientes consultas deben devolver las traducciones del nuevo idioma.

La interfaz debe volver a consultar los textos traducibles al actualizarse o renderizarse. No debe conservar indefinidamente cadenas traducidas si estas pueden cambiar durante la ejecución.

Si el cambio de idioma es una operación asíncrona, el sistema debe evitar estados intermedios inconsistentes. Una opción es cargar primero los recursos y activar el idioma solo cuando estén disponibles.

## 11. Integración con Game

`Game` proporciona acceso al servicio de localización, de forma similar a como proporciona acceso al sistema de entrada.

```js
class Game {
    constructor(config = {}) {
        this.config = config;

        this.localization = new LocalizationManager({
            defaultLocale: config.defaultLocale ?? "en",
            fallbackLocale: config.fallbackLocale ?? "en"
        });
    }

    async initialize() {
        await this.localization.loadLocale(
            this.localization.defaultLocale
        );
    }
}
```

Este ejemplo ilustra la integración; la inicialización real debe coordinarse con el ciclo de vida general del motor definido en `pattern.md`.

El juego debe estar inicializado con los recursos de idioma necesarios antes de mostrar pantallas que dependan de ellos.

## 12. Responsabilidades y límites

`LocalizationManager` se encarga de:

- Gestionar los recursos lingüísticos.
- Seleccionar el idioma activo.
- Resolver claves de traducción.
- Aplicar la política de fallback.
- Interpolar parámetros.
- Informar sobre claves o recursos ausentes.

`LocalizationManager` no se encarga de:

- Dibujar textos.
- Elegir fuentes o tamaños de letra.
- Resolver el diseño de la interfaz.
- Traducir automáticamente los textos.
- Determinar las reglas del juego.
- Gestionar el idioma de audio, salvo que se incorpore explícitamente una integración con ese sistema.

La presentación debe considerar que una traducción puede ocupar más o menos espacio que otra. El ajuste de texto, el tamaño de los elementos y la elección de fuentes pertenecen al sistema de presentación.

## 13. Validación de recursos

Se recomienda validar los archivos de traducción durante el desarrollo o mediante una herramienta de compilación.

Las validaciones deberían comprobar:

1. Que los archivos JSON tengan una sintaxis válida.
2. Que las claves requeridas existan en los idiomas configurados.
3. Que no haya claves duplicadas o estructuras incompatibles.
4. Que los marcadores de parámetros sean coherentes entre traducciones.
5. Que las claves referenciadas por el juego estén definidas o tengan un fallback.
6. Que los archivos estén codificados en UTF-8.

La validación de claves puede implementarse como una herramienta externa al motor para evitar cargar esta responsabilidad en tiempo de ejecución.

## 14. Criterios de aceptación

La implementación se considera válida cuando:

1. Los textos traducibles están separados de la lógica del juego.
2. El código puede solicitar traducciones mediante claves estables.
3. Se pueden cargar varios idiomas.
4. El idioma activo puede cambiar durante la ejecución.
5. Las claves ausentes siguen una política de fallback definida.
6. Los mensajes admiten parámetros dinámicos.
7. Los recursos se validan y los errores se pueden diagnosticar.
8. La ausencia de una traducción no provoca un fallo inesperado del juego.
9. Los estados y sistemas no necesitan conocer la estructura interna de los archivos de traducción.

## 15. Documentos relacionados

- `pattern.md`: arquitectura general, ciclo principal y máquina de estados.
- `input.md`: abstracción de dispositivos y acciones del usuario.
- `rendering.md`: dibujo de texto, fuentes, alineación y presentación.
- `resources.md`: carga, almacenamiento y ciclo de vida de recursos.

