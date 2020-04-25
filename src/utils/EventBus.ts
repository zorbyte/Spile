import isPromise from "is-promise";

/**
 * Event id and listener.
 */
type EventId = string | number | symbol;
type EventListener = (...args: any[]) => void | Promise<void>;

// TODO: Make the event types added via a generic of some sorts? That's probably not a good idea... Find something better... Eventually.

/**
 * This event bus is used for global event dispatching, therefore protecting the encapsulation of Spile.
 */
class EventBus extends null {
  /**
   * The listeners of this event bus.
   */
  private static listeners = new Map<EventId, EventListener[]>();

  /**
   * Sends an event asynchronously to all listeners.
   *
   * @param id The id of the event to emit.
   * @param args The arguments to supply to the event.
   */
  public static async send(id: "line" | "rawLog", data: string): Promise<void>;
  public static async send(id: "ready" | "refreshPrompt" | "close"): Promise<void>;
  public static async send(id: "critical", err: Error): Promise<void>;
  public static async send(id: EventId, ...args: any[]): Promise<void> {
    const foundListeners = [...EventBus.listeners.entries()]
      .filter(([evId]) => evId === id)
      .flatMap(([_, lsFn]) => lsFn)
      .map(listener => (async () => {
        const res = listener(...args);
        if (isPromise) await res;
      })());

    await Promise.all(foundListeners);
  }

  /**
   * Listens to an event with the supplied id.
   *
   * @param id The id of the event to listen to.
   * @param listener The listener function that gets called when the event is emitted.
   */
  public static on(id: "line" | "rawLog", listener: (data: string) => void): void;
  public static on(id: "ready" | "refreshPrompt", listener: () => void): void;
  public static on(id: "critical", listener: (err: Error) => void): void;
  public static on(id: EventId, listener: EventListener): void {
    const listeners = EventBus.listeners.get(id) ?? [];
    listeners.push(listener);
    EventBus.listeners.set(id, listeners);
  }

  /**
   * Remove the listener(s) with the provided id and optionally the provided function.
   *
   * @param id Removes the listener(s) with the given id.
   * @param listener If provided, the listeners with that specific function will be deleted.
   */
  public static off(id: "line" | "rawLog", listener: (data: string) => void): void;
  public static off(id: "ready" | "refreshPrompt", listener?: () => void): void;
  public static off(id: "critical", listener?: (err: Error) => void): void;
  public static off(id: EventId, listener?: EventListener): void {
    const listeners = EventBus.listeners.get(id);
    if (!listeners) return;
    if (!listener) return void EventBus.listeners.delete(id);
    listeners.filter(lsFn => lsFn !== listener);
    EventBus.listeners.set(id, listeners);
  }
}

export default EventBus;
