export function updateUI(context) {
    if (context.isProxy == false) return;

    const keys = Object.keys(context);
    for (let key of keys) {
        context.notifyPropertyChanged(key);
    }
}