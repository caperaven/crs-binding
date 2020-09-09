import {compileExp, releaseExp} from "./events/compiler.js";
import {sanitizeExp} from "./events/expressions.js";
import {parseElement, parseElements, releaseBinding, releaseChildBinding} from "./binding/parse-element.js";
import {ProviderManager} from "./managers/provider-manager.js";
import {IdleTaskManager} from "./idle/idleTaskManager.js";
import {listenOnPath, removeOnPath} from "./binding/listen-on.js";
import {domEnableEvents, domDisableEvents} from "./events/dom-events.js";
import {InflationManager} from "./managers/inflation-manager.js";
import {ValueConverters} from "./managers/value-converters.js";
import {clone} from "./lib/clone.js";
import {bindingData} from "./store/binding-data.js";
import {EventEmitter} from "./events/events.js";
import {RepeatBaseProvider} from "./binding/providers/repeat-base-provider.js";
import {BindableElement} from "../src/binding/bindable-element.js";
import {ViewBase} from "../src/view/view-base.js";
import {ElementStoreManager} from "./managers/element-store-manager.js";
import {measureElement, fragmentToText, disposeProperties} from "./lib/utils.js";
import {forceClean} from "./lib/cleanMemory.js";

String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1)
};

function capitalizePropertyPath(str) {
    const parts = str.split("-");
    for (let i = 1; i < parts.length; i++) {
        parts[i] = parts[i].capitalize();
    }
    let result = parts.join("");
    if (result === "innerHtml") {
        result = "innerHTML";
    }
    return result;
}

const crsbinding = {
    _expFn: new Map(),

    data: bindingData,
    idleTaskManager: new IdleTaskManager(),
    providerManager: new ProviderManager(),
    inflationManager: new InflationManager(),
    elementStoreManager: new ElementStoreManager(),
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

    classes: {
        BindableElement: BindableElement,
        ViewBase: ViewBase,
        RepeatBaseProvider: RepeatBaseProvider
    },

    events: {
        listenOnPath: listenOnPath,
        removeOnPath: removeOnPath,
        emitter: new EventEmitter()
    },

    dom: {
        enableEvents: domEnableEvents,
        disableEvents: domDisableEvents
    },

    utils: {
        capitalizePropertyPath: capitalizePropertyPath,
        clone: clone,
        disposeProperties: disposeProperties,
        fragmentToText: fragmentToText,
        measureElement: measureElement,
        forceClean: forceClean
    }
};

globalThis.crsbinding = crsbinding;
crsbinding.$globals = crsbinding.data.addObject("globals");
crsbinding.data.globals = crsbinding.data.getValue(crsbinding.$globals);