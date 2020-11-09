export const dayOfWeekConverter = {
    set(value) {
        return value;
    },

    get(value) {
        if (value == null) return "";

        const day = value.getDay();
        const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        return days[day];
    }
}