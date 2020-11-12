export const alphaNumericConverter = {
    alphabet: ["", "a", "b", "c", "d", "e", "f"],

    set(value) {
        return this.alphabet.indexOf(value);
    },

    get(value) {
        return this.alphabet[value];
    }
}