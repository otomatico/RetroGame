# Rendering System — Pattern & Abstraction

## 1. Objetivo

Definir un sistema de renderizado reutilizable que permita representar visualmente el mundo del juego y su interfaz mediante una API independiente de la lógica del juego.

El sistema debe proporcionar operaciones comunes para dibujar sprites, imágenes, texto, formas geométricas, animaciones y otros elementos visuales, sin que los estados del juego dependan de una tecnología gráfica concreta.

Por ejemplo, un estado puede solicitar que se dibuje el sprite del jugador en una posición determinada sin conocer los detalles internos de Canvas 2D, WebGL o un motor de renderizado por software.

## 2. Principios de diseño

- **Abstracción:** la lógica del juego no depende de una API gráfica concreta.
- **Separación de responsabilidades:** el renderizado representa el estado del juego, pero no decide sus reglas.
- **Independencia de plataforma:** el motor puede incorporar diferentes implementaciones gráficas.
- **Composición:** el renderizado puede combinar sprites, formas, texto y otros elementos.
- **Configurabilidad:** resolución, escala, cámara y opciones gráficas deben poder configurarse.
- **Reutilización:** los sistemas y juegos pueden utilizar las mismas operaciones gráficas.
- **Integración con recursos:** los recursos visuales se obtienen mediante `ResourceManager`.
- **Determinismo visual:** las reglas de transformación, orden de dibujo y coordenadas deben estar definidas.
- **Extensibilidad:** se pueden añadir nuevas técnicas de renderizado sin modificar la lógica del juego.

## 3. Arquitectura

| Componente | Responsabilidad |
|---|---|
| `RenderManager` | Coordina el proceso de renderizado y expone la interfaz gráfica. |
| `Renderer` | Define el contrato común de dibujo. |
| `CanvasRenderer` | Implementa el renderizado mediante Canvas 2D. |
| `WebGLRenderer` | Implementación alternativa mediante WebGL, si se necesita. |
| `Camera` | Define la transformación entre coordenadas del mundo y coordenadas de pantalla. |
| `Viewport` | Define la región visible y su relación con la superficie de dibujo. |
| `SpriteBatch` | Agrupa operaciones de dibujo para reducir cambios de estado y llamadas gráficas, cuando la plataforma lo permita. |
| `AnimationPlayer` | Calcula el frame visual de una animación a partir de sus datos y del tiempo. |
| `TextRenderer` | Gestiona las operaciones específicas de representación de texto. |

Estos componentes representan responsabilidades lógicas. Una implementación sencilla puede combinar algunos de ellos sin alterar el contrato general.

`CanvasRenderer` es una implementación inicial recomendada para juegos HTML5 2D. No debe ser una dependencia obligatoria del resto de la arquitectura.

## 4. Contrato de Renderer

El motor debe proporcionar una interfaz común para las operaciones gráficas más habituales.

```js
class Renderer {
    beginFrame() {}
    endFrame() {}

    clear(color) {}

    drawImage(image, x, y, options = {}) {}

    drawSprite(
        image,
        sourceRect,
        destinationRect,
        options = {}
    ) {}

    drawRect(x, y, width, height, options = {}) {}
    drawLine(x1, y1, x2, y2, options = {}) {}

    drawText(text, x, y, options = {}) {}

    save() {}
    restore() {}

    setCamera(camera) {}
    resize(width, height) {}
}
```

Este contrato es conceptual. Las implementaciones concretas pueden proporcionar operaciones adicionales, pero deben mantener un conjunto de capacidades comunes.

No todas las implementaciones tienen que admitir todas las funciones avanzadas. Si una capacidad no está disponible, debe declararse explícitamente en lugar de simular un comportamiento incompatible.

## 5. Separación entre RenderManager y Renderer

Se recomienda distinguir la coordinación del renderizado de la implementación gráfica.

### `RenderManager`

Se encarga de:

- Mantener la configuración de renderizado.
- Coordinar el comienzo y el final de cada frame.
- Seleccionar o administrar el `Renderer` activo.
- Integrar cámara y viewport.
- Proporcionar acceso a las operaciones gráficas comunes.

### `Renderer`

Se encarga de:

- Ejecutar las operaciones gráficas.
- Gestionar el contexto de dibujo.
- Aplicar transformaciones y estilos.
- Dibujar los recursos recibidos.
- Gestionar los detalles específicos de la tecnología utilizada.

En un motor pequeño, `RenderManager` puede delegar directamente todas las operaciones en un único `Renderer`.

## 6. Ciclo de renderizado

El renderizado debe ejecutarse como una fase diferenciada del ciclo principal del juego.

Secuencia conceptual:

1. Preparar el frame.
2. Limpiar la superficie de dibujo, si corresponde.
3. Configurar cámara y viewport.
4. Dibujar el fondo.
5. Dibujar los elementos del mundo.
6. Dibujar efectos y elementos en primer plano.
7. Dibujar la interfaz de usuario.
8. Finalizar el frame.

Ejemplo:

```js
function render() {
    renderer.beginFrame();

    renderer.clear("#000000");

    renderer.setCamera(camera);

    renderBackground();
    renderWorld();
    renderEffects();

    renderer.setCamera(null);

    renderUI();

    renderer.endFrame();
}
```

Las funciones `renderBackground()`, `renderWorld()`, `renderEffects()` y `renderUI()` son ilustrativas. Su organización depende del juego y no forma parte obligatoria de la API del renderer.

El motor debe definir cuándo se limpia la superficie y cómo se restablecen las transformaciones para que los elementos de interfaz no hereden accidentalmente la cámara del mundo.

## 7. Coordenadas y resolución

El sistema debe distinguir entre las coordenadas del mundo y las coordenadas de pantalla.

### Coordenadas del mundo

Representan las posiciones de los objetos dentro del juego. Su significado depende del juego: pueden expresarse en píxeles, unidades lógicas o coordenadas de una cuadrícula.

### Coordenadas de pantalla

Representan posiciones sobre la superficie visible donde se dibuja el juego.

La cámara transforma las coordenadas del mundo en coordenadas de pantalla.

La interfaz de usuario puede utilizar coordenadas de pantalla o un sistema de coordenadas lógicas independiente, según la implementación.

La convención elegida debe ser consistente en todo el motor.

## 8. Cámara y viewport

La cámara define qué parte del mundo se observa y cómo se transforma.

Como mínimo, una cámara 2D puede incluir:

- Posición.
- Zoom.
- Rotación opcional.
- Punto de referencia o anclaje.
- Límites opcionales del mundo.

El viewport define el área visible en la superficie de dibujo.

La cámara y el viewport son conceptos distintos: una cámara describe la vista del mundo; el viewport determina dónde se presenta esa vista.

Ejemplo conceptual:

```js
const camera = {
    x: 100,
    y: 80,
    zoom: 2,
    rotation: 0
};

renderer.setCamera(camera);
```

El contrato debe definir cómo se interpretan la posición, el zoom y la rotación. Por ejemplo, si la posición representa el centro de la cámara o su esquina superior izquierda.

La cámara no debe modificar las coordenadas originales de las entidades del juego.

## 9. Sprites y regiones de textura

El sistema debe permitir dibujar una imagen completa o una región concreta de ella.

Esto permite utilizar spritesheets que contienen múltiples imágenes o frames dentro de un único recurso.

Ejemplo:

```js
renderer.drawSprite(
    playerTexture,
    { x: 0, y: 0, width: 16, height: 16 },
    { x: player.x, y: player.y, width: 16, height: 16 }
);
```

El primer rectángulo define la región de origen de la textura; el segundo define el destino de dibujo.

Las opciones de dibujo pueden incluir:

- Escala.
- Opacidad.
- Volteo horizontal o vertical.
- Rotación.
- Origen de transformación.
- Modulación de color, si está soportada.

La estructura de estas opciones debe mantenerse coherente entre las implementaciones compatibles.

## 10. Animaciones

El sistema debe permitir representar animaciones mediante secuencias de frames y sus duraciones.

Se recomienda separar los datos de la animación de la operación gráfica que dibuja cada frame.

Ejemplo de definición:

```js
const playerAnimation = {
    frames: [
        { x: 0, y: 0, width: 16, height: 16 },
        { x: 16, y: 0, width: 16, height: 16 },
        { x: 32, y: 0, width: 16, height: 16 }
    ],
    frameDuration: 0.12,
    loop: true
};
```

`AnimationPlayer` se encarga de determinar el frame actual a partir del tiempo transcurrido. `Renderer` se encarga de dibujarlo.

La actualización de una animación no debe depender de cuántas veces se dibuje un frame. Debe utilizar el tiempo del juego o un reloj explícito para evitar que su velocidad dependa del rendimiento gráfico.

El contrato debe definir cómo se manejan animaciones finalizadas, pausadas y en bucle.

## 11. Texto y tipografía

El renderer debe proporcionar operaciones para dibujar texto sin acoplar el juego a una API gráfica específica.

Ejemplo:

```js
renderer.drawText(
    localization.t("menu.start"),
    20,
    40,
    {
        font: "fonts.pixel",
        size: 16,
        color: "#FFFFFF",
        align: "left"
    }
);
```

La clave `fonts.pixel` se resuelve mediante `ResourceManager`, y el texto se obtiene mediante `LocalizationManager`.

El contrato de texto puede incluir:

- Fuente.
- Tamaño.
- Color.
- Alineación horizontal.
- Alineación vertical.
- Opacidad.
- Ajuste de línea.
- Espaciado entre caracteres, si está soportado.

Debe definirse si la posición vertical representa la parte superior del texto, su línea base o un punto de anclaje.

La carga y la propiedad de las fuentes pertenecen al sistema de recursos. La traducción de los mensajes pertenece al sistema de localización.

## 12. Renderizado pixel art

Para juegos retro y pixel art, el motor puede ofrecer una configuración específica que preserve la nitidez de los píxeles.

Opciones recomendadas:

- Resolución lógica independiente de la resolución física.
- Escalado entero cuando sea posible.
- Muestreo de imagen sin suavizado.
- Coordenadas y tamaños consistentes con la cuadrícula lógica.
- Control explícito de la alineación de sprites.
- Opciones de resolución y relación de aspecto.

Ejemplo de configuración:

```js
const renderConfig = {
    logicalWidth: 320,
    logicalHeight: 180,
    pixelArt: true,
    integerScale: true,
    smoothing: false
};
```

Cuando la ventana no permita un escalado entero exacto, el motor debe definir si utiliza bandas, espacio sobrante o un escalado alternativo.

El renderizado pixel art es una configuración del sistema, no una dependencia de la lógica del juego.

## 13. Integración con ResourceManager

El renderer recibe recursos ya cargados y preparados para dibujarse.

```js
const texture = resources.get("sprites.player");

renderer.drawImage(
    texture,
    player.x,
    player.y
);
```

El renderer no debería cargar archivos directamente ni gestionar por su cuenta el catálogo global de recursos.

Si un recurso no está disponible, el comportamiento debe estar definido. En desarrollo, puede resultar útil dibujar un marcador de error; en producción, se puede omitir el elemento o utilizar un recurso alternativo.

El renderer no debe liberar automáticamente una textura compartida por el mero hecho de terminar de dibujarla.

## 14. Integración con ECS

El sistema de renderizado puede consumir información visual procedente de entidades y componentes, pero no debe convertirse en el propietario de las reglas del juego.

Una entidad puede tener componentes como:

- `Transform`: posición, rotación y escala.
- `Sprite`: recurso visual y región de textura.
- `Animation`: datos o estado de animación.
- `RenderLayer`: orden o capa visual.

Estos nombres son ejemplos de componentes, no una definición obligatoria del modelo ECS. Su estructura y ciclo de vida se especifican en `ecs.md`.

El sistema de renderizado consulta los datos necesarios y produce las operaciones gráficas correspondientes.

No debe cambiar la posición lógica de una entidad, resolver colisiones ni decidir si una entidad está viva.

## 15. Orden de dibujo y capas

El motor debe definir cómo se determina el orden de renderizado.

Una estrategia sencilla utiliza capas lógicas, por ejemplo:

1. Fondo.
2. Terreno.
3. Entidades.
4. Efectos.
5. Primer plano.
6. Interfaz.

Dentro de una capa, el juego puede utilizar el orden de inserción, una prioridad explícita o una ordenación por profundidad.

Para juegos isométricos, puede ser necesario ordenar los objetos por su posición o por un valor de profundidad calculado. Esa política pertenece a la organización de la escena o del sistema de renderizado, no al renderer de bajo nivel.

El orden debe ser determinista cuando varias operaciones compiten por la misma posición visual.

## 16. Gestión del estado gráfico

Las transformaciones, la opacidad, el color y otros atributos gráficos pueden mantenerse entre operaciones según la API subyacente.

Para evitar efectos secundarios, el motor debe definir cómo se conserva y restaura el estado.

Ejemplo:

```js
renderer.save();

renderer.setCamera(camera);
renderer.drawImage(texture, x, y);

renderer.restore();
```

Este ejemplo representa un contrato conceptual. Si el backend no implementa una pila de estado equivalente, debe proporcionar una alternativa compatible o declarar la limitación.

Las operaciones de dibujo no deben dejar estados gráficos inesperados que afecten a elementos posteriores.

## 17. Integración con Game

`Game` coordina la actualización y el renderizado, pero no necesita conocer los detalles internos del backend gráfico.

Ejemplo conceptual:

```js
class Game {
    constructor(config = {}) {
        this.config = config;
        this.renderer = null;
        this.currentState = null;
    }

    update(dt) {
        this.currentState?.update(dt);
    }

    render() {
        this.renderer.beginFrame();

        this.currentState?.render(this.renderer);

        this.renderer.endFrame();
    }
}
```

La inicialización del renderer puede ser asíncrona si el backend necesita preparar recursos o crear un contexto gráfico.

El ciclo principal definido en `pattern.md` es responsable de coordinar las fases de actualización y renderizado.

La implementación debe garantizar que los errores de inicialización y pérdida del contexto gráfico se gestionen de forma explícita cuando la plataforma los permita.

## 18. Rendimiento

El sistema debe permitir optimizaciones sin obligar a los juegos a depender de ellas.

Entre las optimizaciones posibles se encuentran:

- Agrupar operaciones de dibujo compatibles.
- Reutilizar texturas.
- Reducir cambios de estado gráfico.
- Evitar reconstruir datos visuales que no han cambiado.
- Recortar elementos fuera del viewport cuando resulte útil.
- Utilizar renderizado por lotes si el backend lo permite.

Estas optimizaciones deben preservar el comportamiento visual definido por el motor.

No se debe introducir complejidad como `SpriteBatch` o renderizado por lotes antes de que exista una necesidad medible.

## 19. Responsabilidades y límites

`Renderer` se encarga de:

- Dibujar imágenes, sprites, texto y formas.
- Aplicar transformaciones visuales.
- Gestionar las operaciones gráficas del backend.
- Mantener un contrato de dibujo común.

`RenderManager` se encarga de:

- Coordinar el proceso de renderizado.
- Configurar cámara y viewport.
- Seleccionar el backend activo cuando corresponda.

El sistema de renderizado no se encarga de:

- Resolver colisiones.
- Actualizar las reglas de movimiento.
- Decidir la lógica de combate.
- Cargar directamente todos los recursos del juego.
- Traducir textos.
- Decidir qué acciones del usuario deben ejecutarse.
- Determinar las reglas de transición entre estados.

## 20. Criterios de aceptación

La implementación se considera válida cuando:

1. La lógica del juego no depende de una API gráfica concreta.
2. Existe un contrato común para las operaciones de dibujo.
3. El motor puede dibujar imágenes completas y regiones de spritesheets.
4. Cámara y viewport tienen responsabilidades y coordenadas definidas.
5. El sistema puede dibujar texto y formas básicas.
6. El orden de dibujo está documentado.
7. Los recursos visuales se obtienen mediante el sistema de recursos.
8. Las animaciones no dependen de la frecuencia de renderizado.
9. El estado gráfico se gestiona de forma consistente.
10. Las opciones de pixel art se pueden configurar sin cambiar la lógica del juego.
11. La integración con ECS no introduce reglas de juego dentro del renderer.
12. Los fallos de inicialización o disponibilidad de recursos se pueden diagnosticar.

## 21. Documentos relacionados

- `pattern.md`: arquitectura general, ciclo principal y máquina de estados.
- `ecs.md`: entidades, componentes, sistemas y operaciones del mundo.
- `resources.md`: carga, caché y ciclo de vida de recursos.
- `localization.md`: traducciones y selección de idioma.
- `input.md`: dispositivos y acciones lógicas.
- `audio.md`: reproducción de sonido y música, si se define como subsistema independiente.

---
**Decisión de arquitectura**

Para la primera versión del motor, recomiendo implementar un único backend `CanvasRenderer` y mantener el contrato independiente de Canvas.

Hay tres decisiones que conviene fijar antes de implementar:
1. **Resolución lógica**: si el juego dibuja directamente a la resolución del canvas o utiliza una resolución virtual, especialmente importante para pixel art.
2. **Coordenadas**: si las entidades usan píxeles o unidades lógicas, y cómo se transforman mediante la cámara.
3. **Orden de dibujo**: si basta con capas explícitas o si se necesita profundidad calculada, por ejemplo, para el tower defense isométrico.
Estas decisiones afectan al diseño interno, pero no deberían obligar a modificar la interfaz pública de Renderer.