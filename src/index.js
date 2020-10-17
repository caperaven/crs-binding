import {compileExp, releaseExp} from "./events/compiler.js";
import {sanitizeExp} from "./events/expressions.js";
import {parseElement, parseElements, releaseBinding, releaseChildBinding} from "./binding/parse-element.js";
import {ProviderManager} from "./managers/provider-manager.js";
import {IdleTaskManager} from "./idle/idleTaskManager.js";
import {listenOnPath, removeOnPath} from "./binding/listen-on.js";
import {InflationManager} from "./managers/inflation-manager.js";
import {ValueConverters} from "./managers/value-converters.js";
import {clone} from "./lib/clone.js";
import {bindingData} from "./store/binding-data.js";
import {RepeatBaseProvider} from "./binding/providers/repeat-base-provider.js";
import {ElementStoreManager} from "./managers/element-store-manager.js";
import {measureElement, fragmentToText, disposeProperties, cloneTemplate} from "./lib/utils.js";
import {forceClean} from "./lib/cleanMemory.js";
import {renderCollection} from "./lib/renderCollection.js";

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
        RepeatBaseProvider: RepeatBaseProvider,
    },

    events: {
        listenOnPath: listenOnPath,
        removeOnPath: removeOnPath
    },

    utils: {
        capitalizePropertyPath: capitalizePropertyPath,
        clone: clone,
        disposeProperties: disposeProperties,
        fragmentToText: fragmentToText,
        cloneTemplate: cloneTemplate,
        measureElement: measureElement,
        forceClean: forceClean,
        renderCollection: renderCollection
    }
};

globalThis.crsbinding = crsbinding;
crsbinding.$globals = crsbinding.data.addObject("globals");
crsbinding.data.globals = crsbinding.data.getValue(crsbinding.$globals);