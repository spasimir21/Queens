type Listener<T extends [...any[]]> = (...args: T) => void;

class Signal<T extends [...any[]]> {
  private readonly listeners: Listener<T>[] = [];

  public listen(callback: Listener<T>): Listener<T> {
    this.listeners.push(callback);
    return callback;
  }

  public send(...args: T): void {
    for (const listener of this.listeners) listener(...args);
  }

  public remove(callback: Listener<T>): boolean {
    const index = this.listeners.indexOf(callback);
    if (index != -1) this.listeners.splice(index, 1);
    return index != -1;
  }
}

export { Signal };
