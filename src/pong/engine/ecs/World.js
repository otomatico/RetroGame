export class World {
  constructor() {
    this.nextEntityId = 1;
    this.alive = new Set();
    this.components = new Map();
    this.commands = [];
  }

  createEntity() {
    const id = this.nextEntityId++;
    this.alive.add(id);
    return id;
  }

  addComponent(entityId, component) {
    if (!this.alive.has(entityId)) throw new Error(`Entity ${entityId} is not alive`);
    const type = component.constructor;
    if (!this.components.has(type)) this.components.set(type, new Map());
    this.components.get(type).set(entityId, component);
    return component;
  }

  getComponent(entityId, type) { return this.components.get(type)?.get(entityId); }
  hasComponent(entityId, type) { return this.components.get(type)?.has(entityId) ?? false; }

  removeComponent(entityId, type) {
    this.components.get(type)?.delete(entityId);
  }

  destroyEntity(entityId) {
    if (!this.alive.delete(entityId)) return;
    for (const store of this.components.values()) store.delete(entityId);
  }

  query(...types) {
    if (!types.length) return [...this.alive];
    const stores = types.map(type => this.components.get(type));
    if (stores.some(store => !store)) return [];
    const smallest = stores.reduce((a, b) => a.size <= b.size ? a : b);
    return [...smallest.keys()].filter(id => this.alive.has(id) && stores.every(store => store.has(id)));
  }

  queueAddComponent(entityId, component) { this.commands.push(() => this.addComponent(entityId, component)); }
  queueRemoveComponent(entityId, type) { this.commands.push(() => this.removeComponent(entityId, type)); }
  queueDestroy(entityId) { this.commands.push(() => this.destroyEntity(entityId)); }

  flushCommands() {
    const pending = this.commands.splice(0);
    for (const command of pending) {
      try { command(); } catch (error) { console.error("ECS command failed:", error); }
    }
  }
}
