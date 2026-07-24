type Listener = (value: number) => void;

export class CounterService {
  private value = 0;
  private readonly listeners = new Set<Listener>();

  getCount(): number {
    return this.value;
  }

  increment(by = 1): number {
    this.value += by;
    for (const listener of this.listeners) listener(this.value);
    return this.value;
  }

  /** Subscribe to value changes. Returns an unsubscribe function. */
  onChange(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
}
