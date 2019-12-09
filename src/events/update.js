export function updateUI(context) {
    if (context.isProxy == false) return;
    if (Array.isArray(context)) return updateUIArray(context);

    const keys = context.constructor.properties || Object.keys(context).filter(item => item.indexOf("__") == -1 && item != "_isProxy");
    for (let key of keys) {
        crsbinding.events.notifyPropertyChanged(context, key);
    }
}

function updateUIArray (context) {
    context.forEach(item => updateUI(item));
}