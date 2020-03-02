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
                // actual vs empty object
                obj[part] = crsbinding.observation.observe({})
            }

            listenOn(obj, part, callback);
            obj = obj[part];
        }
    }
}

export function listenOn(context, property, callback) {
    if (property.indexOf(".") == -1) {
        crsbinding.events.on(context, property.trim(), callback);
    }
    else {
        crsbinding.events.listenOnPath(context, property, callback);
    }
}
