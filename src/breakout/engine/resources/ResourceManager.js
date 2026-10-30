export class ResourceManager {
  constructor() {
    this.manifest = null;
    this.cache = new Map();
    this.status = new Map();
  }

  async loadManifest(url) {
    this.status.set(url, "loading");
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`Could not load manifest: ${response.status}`);
      this.manifest = await response.json();
      this.cache.set(url, this.manifest);
      this.status.set(url, "loaded");
      return this.manifest;
    } catch (error) {
      this.status.set(url, "error");
      throw error;
    }
  }

  async loadJSON(url) {
    if (this.cache.has(url)) return this.cache.get(url);
    this.status.set(url, "loading");
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`Could not load resource ${url}: ${response.status}`);
      const value = await response.json();
      this.cache.set(url, value);
      this.status.set(url, "loaded");
      return value;
    } catch (error) {
      this.status.set(url, "error");
      throw error;
    }
  }

  get(url) { return this.cache.get(url); }
  getStatus(url) { return this.status.get(url) ?? "unloaded"; }
  unload(url) { this.cache.delete(url); this.status.set(url, "unloaded"); }
  clear() { this.cache.clear(); this.status.clear(); this.manifest = null; }
}
