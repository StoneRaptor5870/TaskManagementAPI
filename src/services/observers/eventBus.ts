type Listener<T> = (data: T) => void;

export class EventBus {
    private static instance: EventBus;
    private listeners: Map<string, Array<Listener<any>>>;

    private constructor() {
        this.listeners = new Map();
    }

    static getInstance(): EventBus {
        if (!EventBus.instance) {
            EventBus.instance = new EventBus();
        }
        return EventBus.instance;
    }

    subscribe<T>(event: string, listener: Listener<T>): () => void {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }

        const eventListeners = this.listeners.get(event)!;
        eventListeners.push(listener);

        // Return unsubscribe function
        return () => {
            const idx = eventListeners.indexOf(listener);
            if (idx > -1) {
                eventListeners.splice(idx, 1);
            }
        };
    }

    publish<T>(event: string, data: T): void {
        if (!this.listeners.has(event)) {
            return;
        }

        const eventListeners = this.listeners.get(event)!;
        for (const listener of eventListeners) {
            listener(data);
        }
    }
}