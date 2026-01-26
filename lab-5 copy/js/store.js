import { generateColor, generateID } from './helpers.js';

const API_URL = 'https://twoj-backend.azurewebsites.net/api/shapes';

class Store {
    #state = {
        shapes: [],
    };

    #subscribers = new Set();

    constructor() {
        this.loadShapes();
    }

    ///////////////////////////////////////////////////// backend

    async loadShapes() {
        const res = await fetch(API_URL);
        const shapes = await res.json();
        this.#setState({ shapes }, { type: 'initialize' });
    }

    ///////////////////////////////////////////////////// core

    subscribe(callback) {
        this.#subscribers.add(callback);
        callback(this.getState(), { type: 'initialize' });
        return () => this.#subscribers.delete(callback);
    }

    #notify(action) {
        const copy = this.getState();
        for (const cb of this.#subscribers) {
            cb(copy, action);
        }
    }

    #setState(newState, action) {
        this.#state = newState;
        this.#notify(action);
    }

    getState() {
        return structuredClone(this.#state);
    }

    ///////////////////////////////////////////////////// actions (API-compatible)

    async addShape(type) {
        const shape = {
            id: generateID(),
            type,
            color: generateColor(),
        };

        const res = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(shape),
        });

        const saved = await res.json();

        this.#setState(
            { shapes: [...this.#state.shapes, saved] },
            { type: 'addShape', shape: saved },
        );
    }

    async removeShape(id) {
        await fetch(`${API_URL}/${id}`, { method: 'DELETE' });

        this.#setState(
            { shapes: this.#state.shapes.filter((s) => s.id !== id) },
            { type: 'removeShape', id },
        );
    }

    async recolorShapes(type) {
        const res = await fetch(`${API_URL}/recolor/${type}`, {
            method: 'PATCH',
        });

        const updated = await res.json();

        this.#setState(
            { shapes: updated },
            { type: 'recolorShapes', shapeType: type },
        );
    }

    getCounts() {
        const counts = { square: 0, circle: 0 };
        for (const s of this.#state.shapes) {
            counts[s.type]++;
        }
        return counts;
    }
}

export const store = new Store();
