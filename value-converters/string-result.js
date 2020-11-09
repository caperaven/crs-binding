export const stringResultConverter = {
    set(value) {
        return value;
    },
    get(value) {
        return String(value);
    }
}