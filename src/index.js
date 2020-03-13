import {compileExp, releaseExp} from "./events/compiler.js";
import {enableEvents, disableEvents} from "./events/event-mixin.js";
import {observe, releaseObserved} from "./events/observer.js";
import {sanitizeExp} from "./events/expressions.js";
import {parseElement, parseElements, releaseBinding, releaseChildBinding} from "./binding/parse-element.js";
import {ProviderManager} from "./managers/provider-manager.js";
import {IdleTaskManager} from "./idle/idleTaskManager.js";
import {updateUI} from "./events/update.js";
import {when, on, notifyPropertyChanged, removeOn, removeWhen, notifyPropertyOn} from "./events/event-mixin.js";
import {listenOn, listenOnPath} from "./binding/listen-on.js";
import {domEnableEvents, domDisableEvents} from "./events/dom-events.js";
import {InflationManager} from "./managers/inflation-manager.js";
import {ValueConverters} from "./managers/value-converters.js";
import {clone} from "./lib/clone.js";
import {ObjectStore} from "./store/object-store.js";

String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1)
};

function capitalizePropertyPath(str) {
    const parts = str.split("-");
    for (let i = 1; i < parts.length; i++) {
        parts[i] = parts[i].capitalize();
    }
    return parts.join("");
}

const crsbinding = {
    _expFn: new Map(),
    _objStore: new ObjectStore(),

    idleTaskManager: new IdleTaskManager(),
    providerManager: new ProviderManager(),
    inflationManager: new InflationManager(),
    valueConverters: new ValueConverters(),

    expression: {
        sanitize: sanitizeExp,
        compile: compileExp,
        release: releaseExp,
        updateUI: updateUI,
    },

    observation: {
        observe: observe,
        releaseObserved: releaseObserved,
        releaseBinding: releaseBinding,
        releaseChildBinding: releaseChildBinding
    },

    parsers: {
        parseElement: parseElement,
        parseElements: parseElements,
    },

    events: {
        enableEvents: enableEvents,
        disableEvents: disableEvents,
        when: when,
        on: on,
        notifyPropertyChanged: notifyPropertyChanged,
        notifyPropertyOn: notifyPropertyOn,
        removeOn: removeOn,
        removeWhen: removeWhen,
        listenOn: listenOn,
        listenOnPath: listenOnPath
    },

    dom: {
        enableEvents: domEnableEvents,
        disableEvents: domDisableEvents
    },

    utils: {
        capitalizePropertyPath: capitalizePropertyPath,
        clone: clone
    }
};

globalThis.crsbinding = crsbinding;

export {
    crsbinding
};