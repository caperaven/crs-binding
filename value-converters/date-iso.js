export const dateToIso = {
    set(value) {
        return value;
    },

    get(value) {
        if (value == null) return "";
        return (new Date(value)).toISOString().split('T')[0];
    }
}