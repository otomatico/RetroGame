export class StateMachine {
  constructor(states = {}) {
    this.states = new Map(Object.entries(states));
    this.current = null;
    this.currentName = null;
  }

  add(name, state) { this.states.set(name, state); }

  change(name, context, payload) {
    const next = this.states.get(name);
    if (!next) throw new Error(`Unknown game state: ${name}`);
    if (this.current === next) return;
    this.current?.exit?.(context);
    this.current = next;
    this.currentName = name;
    this.current.enter?.(context, payload);
    context.onStateChanged?.(name);
    context.statusLabel?.();
  }

  update(context, dt) { this.current?.update?.(context, dt); }
  render(context, renderer) { this.current?.render?.(context, renderer); }
  handleAction(context, action) { this.current?.handleAction?.(context, action); }
}
