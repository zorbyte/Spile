export type Subscriber<T> = (data: T) => void;

export class PubSub {
  private subscribers = new Map<unknown, Subscriber<any>[]>();

  public subscribe<T>(subscribtable: { new (): T }, cb: Subscriber<T>) {
    const subs = this.subscribers.get(subscribtable) ?? [];
    subs.push(cb);
    this.subscribers.set(subscribtable, subs);
  }

  public publish<T>(type: T) {
    const subs = this.subscribers.get(type);
    if (!subs?.length) return;
    subs.forEach(s => s(type));
  }
}
