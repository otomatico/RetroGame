---
title: arquitectura_juego
tags: [arquitectura,juego]
updated: 2026-10-13
---
# Arquitectura generica de un juego

Para construir un videojuego modular, escalable y eficiente en memoria, la combinación de una Máquina de Estados de Aplicación (FSM) para el flujo global, un Bucle de Juego (Game Loop) unificado y el Patrón Entidad-Componente-Sistema (ECS) para la lógica interna es la mejor opción.
A continuación, tienes la "receta" genérica estructurada para diseñar esta arquitectura, junto con la estrategia para la gestión estricta de memoria.

## 1. El Bucle de Juego (Game Loop) y la FSM

El bucle principal es el motor del juego. Se ejecuta continuamente y, en cada iteración, consulta al Estado Activo de la máquina de estados para saber qué actualizar y qué renderizar.
[ Game Loop ] ──> Lee Input ──> [ Estado Activo (FSM) ] ──> Renderiza
                                       │
                                       ├──> Boot (Inicializa)
                                       ├──> MainMenu (UI / Eventos)
                                       ├──> Gameplay (Actualiza ECS)
                                       ├──> Pause (Mantiene ECS congelado)
                                       └──> GameOver (UI / Cleanup)

## 2. Receta de los Estados de la FSM

Cada estado debe implementar una interfaz limpia (Enter, Update, Render, Exit). La liberación de memoria ocurre estrictamente en el método Exit o mediante transiciones controladas.
- Boot: Carga los recursos globales mínimos (fuentes del sistema, configuraciones guardadas). Transiciona inmediatamente a MainMenu.
- MainMenu: Carga la interfaz gráfica del menú. Al salir (Exit), destruye los elementos visuales del menú para liberar la RAM/VRAM de la UI.
- Gameplay:
  - Enter: Asigna memoria para el mundo (ECS Registry), carga el mapa, spawnea jugador y enemigos.
  - Update: Ejecuta los Sistemas del ECS.
  - Exit: Destruye por completo el registro ECS y limpia texturas/audio del nivel actual.
- Pause: Se apila sobre Gameplay (o lo congela). No actualiza los sistemas de movimiento/física del ECS, solo renderiza el fondo congelado y actualiza la UI de pausa.
- GameOver: Muestra la pantalla de derrota/victoria. Mantiene los datos de la partida en caché si se quiere "Reintentar", o los libera si se vuelve al menú.

## 3. Integración del Patrón ECS (Gameplay)

El patrón ECS separa drásticamente los datos de la lógica, lo que permite un uso de memoria contiguo (data-oriented design) muy rápido.
- Entidad (Entity): Un simple identificador numérico (ID entero).
- Componente (Component): Estructuras puras de datos (sin lógica). Ej: Transform (X, Y), Velocity (VX, VY), Collider (Ancho, Alto), Renderable (ID de textura).
- Sistema (System): Lógica pura. No guarda estado. Recibe las entidades que tienen ciertos componentes y las procesa.

## 4. Estrategia de Gestión y Liberación de Memoria

Para evitar fugas de memoria (memory leaks) y parones por culpa del recolector de basura (Garbage Collector en C#/Java) o fragmentación de memoria (en C++), sigue estas reglas:

A. Ciclo de Vida por Estado (RAII)

- Usa el patrón RAII (Resource Acquisition Is Initialization).
- Al pasar de Gameplay a MainMenu, el objeto GameplayState se destruye, invocando su destructor, el cual debe liberar el contenedor de entidades del ECS y descargar las texturas de la tarjeta gráfica (VRAM).

B. Data-Oriented Memory (Arrays Contiguos)

- En el ECS, los componentes del mismo tipo (ej. todos los Transform) deben almacenarse juntos en memoria (std::vector o Sparse Sets).
- Cuando una entidad muere (ej. destruyes un enemigo), no liberes esa memoria inmediatamente con delete. Marca la entidad como "muerta" y reutiliza su espacio para el próximo enemigo que aparezca (Object Pooling).


C. Gestor de Recursos (ResourceManager / Caché)

- Las texturas, audios y modelos 3D no pertenecen a las entidades. El componente Renderable solo guarda un ID o puntero al recurso.
- El ResourceManager lleva un control de referencias (o se limpia manualmente al cambiar de estado).

# Resumen de Ejecución de la Receta

1. Enciende el juego (Boot): Reserva piscinas de memoria estáticas (Memory Pools).
2. Carga Menú (MainMenu): Aloja memoria para UI.
3. Inicia partida (Gameplay): Libera memoria de UI del menú. Aloja buffers contiguos para componentes ECS. Carga assets del nivel.
4. Bucle de juego: Los Sistemas leen y escriben en los componentes en bloques de memoria contiguos hiper-rápidos.
5. Muere el jugador (GameOver): El ECS se pausa o se congela su renderizado.
6. Salir al menú: Se invoca el método de limpieza del ECS, eliminando todas las entidades y liberando los vectores de componentes de golpe de la memoria RAM.
