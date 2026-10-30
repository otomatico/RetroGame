export class EventBus {
  #listeners = new Map();

  on(type, callback) {
    if (!this.#listeners.has(type)) this.#listeners.set(type, new Set());
    this.#listeners.get(type).add(callback);
    return () => this.off(type, callback);
  }

  off(type, callback) {
    this.#listeners.get(type)?.delete(callback);
  }

  emit(type, payload = {}) {
    for (const callback of [...(this.#listeners.get(type) ?? [])]) callback(payload);
  }

  clear() {
    this.#listeners.clear();
  }
}
