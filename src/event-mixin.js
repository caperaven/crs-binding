export function enableEvents(obj) {
    obj.__events = new Map();

    obj.when = when;
    obj.on = on;
    obj.notifyPropertyChanged = notifyPropertyChanged;
}

export function disableEvents(obj) {
    obj.__events.clear();

    delete obj.__events;
    delete obj.when;
    delete obj.on;
    delete obj.notifyPropertyChanged;
}

function when(exp, callback) {
    let functions = this.__events.get(exp) || [];
    functions = [...functions, callback];
    this.__events.set(exp, functions);


}

function on(property, callback) {
    let functions = this.__events.get(property) || [];
    functions = [...functions, callback];
    this.__events.set(property, functions);
}

function notifyPropertyChanged(property) {
    if (this.__events.has(property) == false) return;

    const functions = this.__events.get(property);
    for(let fn of functions) {
        fn();
    }
}