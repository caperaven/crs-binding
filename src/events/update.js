export function updateUI(context) {
    if (context.__isProxy == false) return;
    if (Array.isArray(context)) return updateUIArray(context);

    const keys = context.constructor.properties || Object.keys(context).filter(item => item.indexOf("__") == -1 && item != "__isProxy");
    for (let key of keys) {
        crsbinding.events.notifyPropertyChanged(context, key);
        if (Array.isArray(context[key])) {
            updateUIArray(context[key]);
        }
    }
}

function updateUIArray (context) {
    context.forEach(item => updateUI(item));
}