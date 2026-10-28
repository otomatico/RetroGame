# ECS — Entity Component System

## 1. Objetivo

El patrón ECS permite representar el mundo de un juego mediante entidades, componentes y sistemas independientes.

El objetivo de esta arquitectura es permitir que nuevos componentes y sistemas puedan incorporarse sin modificar el núcleo del motor.

Principios fundamentales:

- Las entidades son identificadores, no objetos con lógica propia.
- Los componentes contienen datos.
- Los sistemas implementan comportamientos.
- `World` administra las entidades y sus componentes.
- Los sistemas no deben depender de clases concretas de entidades.
- Las modificaciones estructurales del mundo pueden aplazarse hasta un momento seguro.
- Las reglas del juego determinan las consecuencias de las colisiones.

## 2. Arquitectura

### World

Responsabilidades:

- Crear y registrar entidades.
- Asociar componentes a entidades.
- Consultar componentes y entidades.
- Eliminar entidades y sus componentes.
- Registrar operaciones estructurales pendientes.
- Procesar las operaciones pendientes en un momento seguro.

`World` no debe utilizar `instanceof` para reconocer componentes ni contener lógica específica del juego.

### Entity

Una entidad se representa mediante un identificador único.

```javascript
const player = world.createEntity();
const enemy = world.createEntity();
```

Una entidad no necesita una clase `Player` o `Enemy`. Su comportamiento se determina mediante sus componentes y los sistemas que los procesan.

### Component

Un componente representa una característica de una entidad.

```javascript
class Position {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }
}

class Velocity {
    constructor(vx = 0, vy = 0) {
        this.vx = vx;
        this.vy = vy;
    }
}

class Collider {
    constructor(width, height, options = {}) {
        this.width = width;
        this.height = height;

        this.enabled = options.enabled ?? true;
        this.layer = options.layer ?? "default";
        this.mask = options.mask ?? null;
    }
}
```

Los componentes deben ser independientes de los sistemas que los utilizan.

### System

Un sistema consulta los componentes que necesita y procesa las entidades correspondientes.

Ejemplos:

- `MovementSystem`: posición y velocidad.
- `CollisionSystem`: posición y collider.
- `RenderSystem`: posición y sprite.
- `HealthSystem`: salud y daño.
- `AISystem`: estado de inteligencia artificial y datos de percepción.

## 3. Registro genérico de componentes

Para evitar modificar `World` cada vez que se introduce un componente nuevo, se utilizará un registro genérico basado en claves.

```javascript
class World {
    constructor() {
        this.nextEntityId = 0;
        this.entities = new Set();

        // Nombre del componente -> entidad -> datos.
        this.components = new Map();

        // Operaciones estructurales pendientes.
        this.commands = [];
    }

    createEntity() {
        const id = ++this.nextEntityId;
        this.entities.add(id);
        return id;
    }

    addComponent(entityId, type, component) {
        if (!this.entities.has(entityId)) {
            throw new Error(`Entidad inexistente: ${entityId}`);
        }

        if (!this.components.has(type)) {
            this.components.set(type, new Map());
        }

        this.components.get(type).set(entityId, component);
    }

    getComponent(entityId, type) {
        return this.components.get(type)?.get(entityId);
    }

    hasComponent(entityId, type) {
        return this.components.get(type)?.has(entityId) ?? false;
    }

    removeComponent(entityId, type) {
        this.components.get(type)?.delete(entityId);
    }

    query(...types) {
        if (types.length === 0) return [];

        const stores = types.map(type => this.components.get(type));

        if (stores.some(store => !store)) return [];

        const [first, ...rest] = stores;

        const result = [];

        for (const entityId of first.keys()) {
            if (
                this.entities.has(entityId) &&
                rest.every(store => store.has(entityId))
            ) {
                result.push({
                    entityId,
                    components: stores.map(store => store.get(entityId))
                });
            }
        }

        return result;
    }

    destroyEntity(entityId) {
        if (!this.entities.has(entityId)) return;

        this.entities.delete(entityId);

        for (const store of this.components.values()) {
            store.delete(entityId);
        }
    }
}
```

Ejemplo de uso:

```javascript
const world = new World();

const player = world.createEntity();

world.addComponent(
    player,
    "Position",
    new Position(10, 20)
);

world.addComponent(
    player,
    "Velocity",
    new Velocity(1, 0)
);

const movingEntities = world.query("Position", "Velocity");
```

El registro permite incorporar componentes sin modificar `World`.

Los identificadores de componente deben ser estables y estar centralizados para evitar errores tipográficos. En una implementación posterior pueden sustituirse las cadenas por símbolos o identificadores registrados.

## 4. Sistemas y ciclo de actualización

Los sistemas se ejecutan durante `update(dt)` del estado activo.

```javascript
class MovementSystem {
    update(world, dt) {
        const seconds = dt / 1000;

        for (const { components } of world.query(
            "Position",
            "Velocity"
        )) {
            const [position, velocity] = components;

            position.x += velocity.vx * seconds;
            position.y += velocity.vy * seconds;
        }
    }
}
```

El estado `PLAYING` coordina los sistemas:

```javascript
update(dt) {
    this.movementSystem.update(this.game.world, dt);
    this.collisionSystem.update(this.game.world, dt);

    this.game.world.flushCommands();
}
```

La fase de aplicación de operaciones pendientes debe estar definida en el ciclo del motor para evitar modificaciones estructurales inesperadas mientras se recorren las entidades.

## 5. Colisiones y ciclo de vida de las entidades

### 5.1. Separación de responsabilidades

El sistema de colisiones no debe decidir automáticamente que dos entidades deben destruirse.

Se distinguen tres responsabilidades:

1. **Detección:** determinar qué entidades están colisionando.
2. **Resolución:** decidir qué sucede como consecuencia de la colisión.
3. **Aplicación:** ejecutar los cambios solicitados sobre el mundo.

Por ejemplo, cuando una bala impacta contra un enemigo:

- El sistema de colisiones detecta el impacto.
- La lógica de combate aplica el daño.
- Si el enemigo pierde toda su salud, se solicita su destrucción.
- Si la bala debe desaparecer al impactar, también se solicita su destrucción.
- El mundo aplica las solicitudes al finalizar la fase correspondiente.

Una pared, en cambio, normalmente no se destruye por el hecho de colisionar.

### 5.2. Cola de operaciones pendientes

La cola `commands` permite solicitar modificaciones sin ejecutarlas inmediatamente.

Se recomienda admitir, al menos, estas operaciones:

- `destroyEntity`: destruir una entidad y todos sus componentes.
- `removeComponent`: retirar un componente de una entidad.
- `addComponent`: añadir un componente a una entidad.

Las operaciones se procesan de forma ordenada en un punto controlado del ciclo de actualización.

```javascript
queueDestroy(entityId) {
    this.commands.push({
        type: "destroyEntity",
        entityId
    });
}

queueRemoveComponent(entityId, componentType) {
    this.commands.push({
        type: "removeComponent",
        entityId,
        componentType
    });
}

queueAddComponent(entityId, componentType, component) {
    this.commands.push({
        type: "addComponent",
        entityId,
        componentType,
        component
    });
}

flushCommands() {
    const pending = this.commands;
    this.commands = [];

    for (const command of pending) {
        switch (command.type) {
            case "destroyEntity":
                this.destroyEntity(command.entityId);
                break;

            case "removeComponent":
                this.removeComponent(
                    command.entityId,
                    command.componentType
                );
                break;

            case "addComponent":
                this.addComponent(
                    command.entityId,
                    command.componentType,
                    command.component
                );
                break;
        }
    }
}
```

Estos métodos se incorporarían a `World`.

Esta versión representa el mecanismo básico. Una implementación de producción deberá validar las operaciones, impedir duplicados innecesarios y definir cómo se gestionan las operaciones contradictorias, como añadir un componente a una entidad que ya está pendiente de destrucción.

### 5.3. ¿Cómo se decide si se destruyen las entidades?

La decisión pertenece a las reglas del juego, no al sistema geométrico de colisiones.

Una política sencilla podría ser:

| Tipo de interacción | Resultado |
|---|---|
| Bala contra enemigo | Destruir la bala y, si corresponde, al enemigo. |
| Jugador contra pared | Mantener ambos y resolver el movimiento. |
| Jugador contra moneda | Destruir la moneda y aumentar la puntuación. |
| Enemigo contra jugador | Aplicar daño al jugador. |
| Proyectil contra escudo | Destruir el proyectil o modificar el escudo según las reglas. |

La tabla ilustra comportamientos posibles, no reglas obligatorias del motor.

### 5.4. Resolución mediante eventos

El sistema de colisiones puede comunicar los impactos mediante eventos.

```javascript
class CollisionSystem {
    constructor(eventBus) {
        this.eventBus = eventBus;
    }

    reportCollision(entityA, entityB) {
        this.eventBus.emit("collision", {
            entityA,
            entityB
        });
    }
}
```

La lógica de combate puede escuchar el evento:

```javascript
eventBus.on("collision", ({ entityA, entityB }) => {
    // Consultar los componentes y las reglas del juego.
    // Aplicar daño cuando corresponda.
    // Solicitar destrucciones mediante World.
});
```

El evento comunica que ocurrió una colisión; no implica que deba destruirse ninguna entidad.

Para evitar dependencias circulares, los sistemas deberían recibir `World` y `EventBus` mediante sus dependencias, en lugar de acceder a variables globales.

## 6. Reglas de consistencia

La implementación deberá cumplir las siguientes reglas:

1. Ninguna entidad destruida puede conservar componentes registrados en el mundo.
2. Destruir una entidad inexistente debe ser una operación segura e idempotente.
3. Una entidad pendiente de destrucción no debe procesarse como si continuara activa en fases posteriores, según la política de actualización definida.
4. Los sistemas deben evitar modificar la estructura de sus colecciones mientras las recorren.
5. Las operaciones pendientes deben procesarse en un punto explícito del ciclo del motor.
6. La detección de colisiones no debe imponer las reglas de combate.
7. Los componentes deben poder registrarse sin modificar `World`.
8. El sistema de renderizado debe ignorar entidades destruidas.
9. El orden de ejecución de los sistemas debe estar definido.
10. La política para colisiones repetidas durante varios fotogramas debe documentarse.

## 7. Decisiones pendientes

Antes de cerrar el diseño del ECS, deberán definirse:

- Si las entidades tienen únicamente identificadores incrementales o también generaciones para evitar referencias obsoletas.
- Si `query()` devuelve una lista nueva o proporciona un mecanismo de iteración eficiente.
- Si la cola de operaciones admite únicamente cambios estructurales o también eventos de juego.
- Si los sistemas pueden consultar el mundo mientras se procesan las operaciones pendientes.
- Cómo se resuelven las colisiones simultáneas y los impactos repetidos.
- Si las colisiones se procesan mediante eventos inmediatos o una fase específica de resolución.

## 8. Criterios de aceptación

El ECS se considerará preparado para integrarse en el motor cuando:

- Sea posible añadir un componente nuevo sin modificar `World`.
- Sea posible crear y destruir entidades junto con todos sus componentes.
- Las consultas devuelvan únicamente entidades con todos los componentes solicitados.
- Los sistemas puedan solicitar destrucciones sin alterar las colecciones que están recorriendo.
- El sistema de colisiones detecte impactos sin destruir entidades automáticamente.
- Las reglas del juego puedan determinar qué entidades se destruyen tras cada impacto.
- Las operaciones pendientes se procesen de forma determinista y en un punto documentado del ciclo de actualización.

---
Hay un último matiz importante: la cola de comandos y el bus de eventos no son lo mismo. Un evento comunica que ha sucedido algo; un comando solicita que se haga algo. Mantener esa distinción hará que tu motor sea más fácil de extender y depurar.