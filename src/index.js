import {compileExp, releaseExp} from "./events/compiler.js";
import {sanitizeExp} from "./events/expressions.js";
import {parseElement, parseElements, releaseBinding, releaseChildBinding} from "./binding/parse-element.js";
import {ProviderManager} from "./managers/provider-manager.js";
import {IdleTaskManager} from "./idle/idleTaskManager.js";
import {listenOn, listenOnPath} from "./binding/listen-on.js";
import {domEnableEvents, domDisableEvents} from "./events/dom-events.js";
import {InflationManager} from "./managers/inflation-manager.js";
import {ValueConverters} from "./managers/value-converters.js";
import {clone} from "./lib/clone.js";
import {bindingData} from "./store/binding-data.js";
import {EventEmitter} from "./events/events.js";

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

function disposeProperties(obj) {
    const properties = Object.getOwnPropertyNames(obj).filter(prop => obj[prop] && obj[prop].__isProxy == true);
    for (let property of properties) {
        const pObj = obj[property];
        if (Array.isArray(pObj) != true) {
            disposeProperties(pObj);
        }
        delete obj[property];
    }
}

const crsbinding = {
    _expFn: new Map(),

    data: bindingData,
    idleTaskManager: new IdleTaskManager(),
    providerManager: new ProviderManager(),
    inflationManager: new InflationManager(),
    valueConverters: new ValueConverters(),

    expression: {
        sanitize: sanitizeExp,
        compile: compileExp,
        release: releaseExp
    },

    observation: {
        releaseBinding: releaseBinding,
        releaseChildBinding: releaseChildBinding
    },

    parsers: {
        parseElement: parseElement,
        parseElements: parseElements,
    },

    events: {
        listenOn: listenOn,
        listenOnPath: listenOnPath,
        emitter: new EventEmitter()
    },

    dom: {
        enableEvents: domEnableEvents,
        disableEvents: domDisableEvents
    },

    utils: {
        capitalizePropertyPath: capitalizePropertyPath,
        clone: clone,
        disposeProperties: disposeProperties
    }
};

globalThis.crsbinding = crsbinding;
crsbinding.$globals = crsbinding.data.addObject("globals");
crsbinding.data.globals = crsbinding.data.getValue(crsbinding.$globals);

export {
    crsbinding
};