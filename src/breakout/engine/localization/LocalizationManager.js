export class LocalizationManager {
  constructor(resources, defaultLocale = "en") {
    this.resources = resources;
    this.defaultLocale = defaultLocale;
    this.locale = defaultLocale;
    this.catalogues = new Map();
    this.onChange = new Set();
  }

  async setLocale(locale) {
    const url = this.resources.manifest?.locales?.[locale];
    if (!url) throw new Error(`Locale not registered: ${locale}`);
    const catalogue = await this.resources.loadJSON(url);
    this.catalogues.set(locale, catalogue);
    this.locale = locale;
    for (const callback of this.onChange) callback(locale);
  }

  subscribe(callback) { this.onChange.add(callback); return () => this.onChange.delete(callback); }

  t(key, params = {}) {
    const current = this.catalogues.get(this.locale) ?? {};
    const fallback = this.catalogues.get(this.defaultLocale) ?? {};
    let value = current[key] ?? fallback[key] ?? key;
    return String(value).replace(/\{(\w+)\}/g, (_, name) => params[name] ?? `{${name}}`);
  }

  toggle() { return this.setLocale(this.locale === "es" ? "en" : "es"); }
}
