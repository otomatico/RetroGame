# Visual Style Guide — Retro Neon Minimal

**Versión:** 1.0  
**Proyecto de referencia:** Pong — Engine Architecture Example  
**Tipo de documento:** Guía de identidad visual reutilizable para videojuegos

## 1. Objetivo artístico

El estilo gráfico adoptado se denomina **Retro Neon Minimal**: una estética arcade que combina minimalismo geométrico, colores neón, fondos oscuros y una interfaz técnica inspirada en los videojuegos clásicos.

El objetivo no es reproducir exactamente los gráficos de los años 80, sino reinterpretar su lenguaje visual con una presentación moderna, limpia y legible.

La estética debe transmitir:

- **Arcade:** reglas visuales claras, elementos reconocibles y acción inmediata.
- **Tecnología:** apariencia de terminal, panel electrónico o dispositivo digital.
- **Minimalismo:** pocos elementos, cada uno con una función visual definida.
- **Contraste:** los objetos importantes destacan sobre el entorno.
- **Consistencia:** todos los juegos comparten el mismo lenguaje gráfico, independientemente de su género.

## 2. Principios visuales

### 2.1. Fondo oscuro

El fondo utiliza tonos casi negros con un ligero matiz azul. Esto evita el negro absoluto como único recurso y aporta profundidad sin distraer al jugador.

Color principal de referencia:

- Fondo del juego: `#070B13`
- Fondo general de la página: `#090D16`
- Superficies de interfaz: `#111827`

Se pueden añadir degradados radiales muy sutiles en menús y pantallas exteriores al área de juego. La zona de acción debe mantener un fondo estable y oscuro.

### 2.2. Geometría simple

Los elementos se construyen mediante formas básicas:

- Rectángulos para objetos sólidos, paneles y plataformas.
- Círculos para objetos redondos, proyectiles y marcadores.
- Líneas discontinuas para divisiones, trayectorias o referencias espaciales.
- Bordes rectos y esquinas discretas para los paneles de interfaz.

No se necesitan texturas complejas para conseguir identidad visual. La composición, la escala, el contraste y el movimiento deben aportar el carácter del juego.

### 2.3. Color como lenguaje

El color no es únicamente decorativo: identifica categorías y prioridades.

| Uso | Color | Código |
|---|---|---|
| Fondo principal | Azul casi negro | `#070B13` |
| Fondo de interfaz | Azul oscuro | `#111827` |
| Elementos principales | Blanco frío | `#EEF5FF` |
| Acento primario | Cian neón | `#63F4DC` |
| Acento secundario | Rosa neón | `#FF648C` |
| Líneas y divisores | Azul grisáceo oscuro | `#25354B` |
| Texto secundario | Azul grisáceo | `#6D809B` |

El cian y el rosa forman la combinación de acentos característica del estilo. Pueden identificar jugadores, equipos, tipos de entidad o acciones opuestas.

El blanco frío se reserva para información que debe ser especialmente legible. Los tonos apagados se utilizan para información secundaria.

Estos colores son la paleta de referencia, no una obligación para todos los objetos de cada juego.

## 3. Tipografía

La interfaz combina dos familias tipográficas:

- **Space Grotesk:** títulos grandes, nombres de juegos y encabezados.
- **Space Mono:** puntuaciones, etiquetas, controles, indicadores y pequeños textos técnicos.

La combinación de una tipografía geométrica moderna con otra monoespaciada refuerza el carácter tecnológico.

### Reglas de uso

1. Los títulos deben ser breves, contundentes y fáciles de reconocer.
2. Las etiquetas técnicas pueden usar mayúsculas y espaciado entre caracteres.
3. La información secundaria debe tener menos contraste que la información principal.
4. Las puntuaciones deben ser grandes y legibles a distancia.
5. No se deben utilizar demasiadas familias tipográficas en un mismo juego.

Si las fuentes externas no están disponibles, se deben emplear alternativas del sistema con características similares. El juego debe seguir siendo legible sin conexión.

## 4. Interfaz de usuario

La interfaz utiliza una estructura de panel técnico: composición ordenada, bordes finos, superficies oscuras y pequeños acentos luminosos.

### Cabecera

La cabecera contiene el nombre del juego, una etiqueta contextual y los controles globales.

Características:

- Título grande alineado a la izquierda.
- Indicadores de estado compactos.
- Botones rectangulares con borde fino.
- Separación clara entre identidad del juego y controles.

### Área de juego

El área de juego es el elemento dominante de la composición.

- Debe disponer de un contenedor claramente delimitado.
- Los bordes son sutiles y no deben competir con la acción.
- La relación de aspecto debe mantenerse constante cuando sea posible.
- Los elementos interactivos deben tener un contraste superior al del decorado.
- Las superposiciones, como pausa o fin de partida, deben oscurecer el fondo sin ocultar por completo el contexto.

### Pie de interfaz

El pie de interfaz muestra controles, atajos y explicaciones breves.

Los controles se presentan como pequeñas teclas dibujadas, con fondo oscuro, borde visible y texto claro. Este recurso puede reutilizarse para mostrar comandos, estados o acciones disponibles.

### Botones

Los botones deben ser compactos y rectangulares, con una respuesta visual discreta al pasar el cursor o recibir el foco.

El cian puede indicar interacción o selección. El rosa puede destacar acciones especiales o estados importantes, pero no debe utilizarse indiscriminadamente.

## 5. Efectos gráficos

Los efectos deben reforzar la estética sin reducir la legibilidad.

### Scanlines

Se pueden utilizar líneas horizontales semitransparentes sobre el área de juego para evocar una pantalla CRT.

Reglas:

- Opacidad muy baja.
- Separación uniforme.
- Sin parpadeo agresivo.
- Desactivables si afectan a la legibilidad o al rendimiento.

### Resplandor neón

El resplandor puede utilizarse en títulos, indicadores y elementos destacados.

Debe ser moderado: primero se reconoce la forma del objeto y después se percibe el efecto luminoso. El brillo no debe sustituir al contraste.

### Líneas discontinuas

Las líneas discontinuas se emplean para divisiones de campo, referencias centrales o elementos de orientación. Deben ser sencillas y regulares.

### Sombras y profundidad

Las sombras se utilizan principalmente para separar la interfaz del fondo. Se prefieren sombras amplias y oscuras frente a sombras duras muy marcadas.

La profundidad es secundaria: el estilo funciona principalmente mediante siluetas, contraste y composición.

## 6. Animación y respuesta visual

El movimiento debe ser preciso y funcional, con una sensación arcade.

Principios:

- Respuesta inmediata a las acciones del jugador.
- Animaciones breves para impactos, puntos, cambios de estado y confirmaciones.
- Transiciones discretas entre menú, partida, pausa y resultado.
- Efectos de impacto breves, sin partículas excesivas.
- Evitar movimientos decorativos constantes que distraigan de la acción.

En juegos de acción, la velocidad y la legibilidad tienen prioridad sobre los efectos visuales complejos.

## 7. Cómo adaptar el estilo a otros géneros

La identidad visual debe mantenerse aunque cambie la temática.

| Género | Adaptación |
|---|---|
| Plataformas 2D | Siluetas geométricas, escenarios oscuros, personajes con acentos cian o rosa y efectos de impacto breves. |
| Tower defense | Terreno oscuro, caminos claramente diferenciados, torres geométricas, alcance resaltado y enemigos codificados por color. |
| Shooter arcade | Proyectiles luminosos, enemigos con siluetas simples, explosiones breves y HUD compacto. |
| Roguelike | Habitaciones delimitadas, objetos reconocibles, interfaces de inventario oscuras y rarezas indicadas mediante acentos. |
| Juego de puzles | Cuadrículas precisas, colores funcionales, animaciones cortas y transiciones limpias. |
| Juego de estrategia | Paneles técnicos, mapas con líneas claras, unidades fácilmente distinguibles e indicadores de selección discretos. |

No es necesario utilizar siempre los mismos colores para todas las entidades. La paleta puede ampliarse si el diseño necesita distinguir más categorías, siempre que se mantengan el fondo oscuro, el contraste y el uso controlado del color.

## 8. Escala y legibilidad

El estilo debe funcionar en distintas resoluciones y tamaños de pantalla.

- Los elementos principales deben conservar una silueta reconocible.
- El texto informativo no debe depender de tamaños excesivamente pequeños.
- Los bordes finos deben ajustarse a la resolución de salida.
- Los efectos de scanlines deben escalar sin producir patrones molestos.
- Las áreas táctiles deben ser mayores que los elementos visuales pequeños cuando el juego se adapte a móviles.

Si un juego utiliza pixel art, debe conservarse una cuadrícula de píxeles coherente. Si utiliza gráficos vectoriales o Canvas de alta resolución, se pueden mantener bordes suaves sin abandonar el lenguaje geométrico.

## 9. Accesibilidad

El color no debe ser el único medio para comunicar información importante.

Por ejemplo, dos equipos de colores distintos también pueden diferenciarse mediante símbolos, etiquetas o formas. El texto debe mantener un contraste suficiente y los efectos visuales no deben dificultar la lectura.

Las opciones de accesibilidad pueden incluir:

- Reducir o desactivar scanlines y resplandor.
- Aumentar el tamaño de texto.
- Cambiar el volumen de los efectos de sonido.
- Ofrecer señales visuales alternativas para eventos importantes.

## 10. Tokens visuales recomendados

Para compartir el estilo entre proyectos, conviene centralizar los valores visuales en una configuración común.

```css
:root {
  --color-background: #070B13;
  --color-panel: #111827;
  --color-primary: #63F4DC;
  --color-secondary: #FF648C;
  --color-text: #EEF5FF;
  --color-muted: #6D809B;
  --color-border: #25354B;

  --font-display: "Space Grotesk", sans-serif;
  --font-interface: "Space Mono", monospace;

  --border-thin: 1px;
  --panel-padding: 16px;
  --glow-strength: 0.15;
}
```

Estos tokens deben ser el punto de partida común. Cada juego puede ampliarlos mediante una paleta temática o una configuración específica sin modificar los principios fundamentales del estilo.

## 11. Lista de comprobación artística

Antes de dar por terminada una pantalla, comprobar:

- [ ] El fondo es oscuro y no compite con los elementos principales.
- [ ] Los elementos interactivos se reconocen inmediatamente.
- [ ] El cian y el rosa tienen funciones visuales consistentes.
- [ ] Los títulos y los indicadores usan la jerarquía tipográfica prevista.
- [ ] La interfaz mantiene una composición ordenada y compacta.
- [ ] Los efectos de brillo y scanlines son discretos.
- [ ] Las animaciones no perjudican la lectura de la acción.
- [ ] La pantalla sigue siendo legible en resoluciones pequeñas.
- [ ] La información importante no depende exclusivamente del color.
- [ ] La estética funciona incluso si se desactivan los efectos decorativos.

## 12. Regla de identidad

**Mantener la estructura, el contraste y el lenguaje visual; adaptar los detalles a cada juego.**

La identidad Retro Neon Minimal se define por sus fondos oscuros azulados, geometría sencilla, acentos neón controlados, tipografía técnica, interfaces compactas y animaciones funcionales.

No se define por utilizar siempre Pong, una pista central o dos colores de jugador. Esos elementos pertenecen al juego de referencia; los principios anteriores constituyen el estilo reutilizable.
