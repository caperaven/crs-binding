export class ValueConverters {
    constructor() {
        this._converters = new Map();
    }

    dispose() {
        this._converters.clear();
        this._converters = null;
    }

    register(valueType, converter) {
        this._converters.set(valueType, converter);
    }

    unregister(valueType) {
        this._converters.delete(valueType)
    }

    convertTo(valueType, value) {
        const converter = this._converters.get(valueType);
        if (converter == null) return value;
        return converter.convertTo(value);
    }

    convertBack(valueType, value) {
        const converter = this._converters.get(valueType);
        if (converter == null) return value;
        return converter.convertBack(value);
    }
}