export const dayOfWeekConverter = {
    set(value) {
        if (value == null) return "";

        if (typeof value == "string") {
            value = new Date(value);
        }

        const day = value.getDay();
        const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        return days[day];
    },

    get(value) {
        return value;
    }
}