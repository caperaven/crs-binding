export function listenOnPath(context, value, callback) {
    let obj = context;
    const parts = value.split(".");
}

export function listenOn(context, property, callback) {
    if (property.indexOf(".") == -1) {
        crsbinding.events.on(context, property.trim(), callback);
    }
    else {
        crsbinding.events.listenOnPath(context, property, callback);
    }
}
