export default class EventBus {

    static #subscriptions = {}

    static subscribe(eventType, callback) {

        if(!this.#subscriptions[eventType]) {
            this.#subscriptions[eventType] = [];
        }

        this.#subscriptions[eventType].push(callback);
    }

    static publish(eventType, arg) {

        if(!this.#subscriptions[eventType]) {
            return;
        }

        Object.values(this.#subscriptions[eventType]).forEach(callback => callback(arg));
    }
}