export class ValueConvertersManager {
    constructor() {
        this._converters = new Map();
    }

    /**
     * Add a converter
     * @param key
     * @param converter
     */
    add(key, converter) {
        this._converters.set(key, converter);
    }

    /**
     * Get a converter based on key
     * @param key
     * @returns {unknown}
     */
    get(key) {
        return this._converters.get(key);
    }

    /**
     * Remove converter
     * @param key
     */
    remove(key) {
        this._converters.delete(key);
    }

    /**
     *
     * @param value {any} value to convert
     * @param key {string} converter key
     * @param direction {string} get || set
     */
    convert(value, key, direction) {
        const converter = this._converters.get(key);
        if (converter == null) return null;
        return converter[direction](value);
    }
}