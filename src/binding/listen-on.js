export function listenOnPath(context, value, callback) {
    let obj = context;
    const parts = value.split(".");

    for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        if (i == parts.length -1) {
            listenOn(obj, part, callback);
        }
        else {
            if (obj[part] == null) {
                obj[part] = crsbinding.observe({})
            }

            listenOn(obj, part, callback);
            obj = obj[part];
        }
    }
}

export function listenOn(context, property, callback) {
    crsbinding.events.on(context, property, callback);
}
