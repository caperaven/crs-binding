import {compileExp, releaseExp} from "./events/compiler.js";
import {sanitizeExp} from "./events/expressions.js";
import {parseElement, parseElements, releaseBinding, releaseChildBinding} from "./binding/parse-element.js";
import {ProviderManager} from "./managers/provider-manager.js";
import {IdleTaskManager} from "./idle/idleTaskManager.js";
import {listenOnPath, removeOnPath} from "./binding/listen-on.js";
import {domEnableEvents, domDisableEvents} from "./events/dom-events.js";
import {InflationManager} from "./managers/inflation-manager.js";
import {clone} from "./lib/clone.js";
import {BindingData} from "./store/binding-data.js";
import {EventEmitter} from "./events/events.js";
import {RepeatBaseProvider} from "./binding/providers/repeat-base-provider.js";
import {BindableElement} from "../src/binding/bindable-element.js";
import {ViewBase} from "../src/view/view-base.js";
import {Widget} from "../src/view/crs-widget.js";
import {ElementStoreManager} from "./managers/element-store-manager.js";
import {ValueConvertersManager} from "./managers/value-converters-manager.js";
import {measureElement, fragmentToText, disposeProperties, cloneTemplate, relativePathFrom, getPathOfFile} from "./lib/utils.js";
import {forceClean} from "./lib/cleanMemory.js";
import {renderCollection} from "./lib/renderCollection.js";
import {getValueOnPath} from "./lib/path-utils.js";

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

    data: new BindingData(),
    idleTaskManager: new IdleTaskManager(),
    providerManager: new ProviderManager(),
    inflationManager: new InflationManager(),
    elementStoreManager: new ElementStoreManager(),
    valueConvertersManager: new ValueConvertersManager(),

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
        RepeatBaseProvider: RepeatBaseProvider,
        Widget: Widget
    },

    events: {
        listenOnPath: listenOnPath,
        removeOnPath: removeOnPath,
        emitter: new EventEmitter()
    },

    dom: {
        enableEvents: domEnableEvents,
        disableEvents: domDisableEvents,
    },

    utils: {
        capitalizePropertyPath: capitalizePropertyPath,
        clone: clone,
        disposeProperties: disposeProperties,
        fragmentToText: fragmentToText,
        cloneTemplate: cloneTemplate,
        measureElement: measureElement,
        forceClean: forceClean,
        renderCollection: renderCollection,
        relativePathFrom: relativePathFrom,
        getPathOfFile: getPathOfFile,
        getValueOnPath: getValueOnPath
    }
};

globalThis.crsbinding = crsbinding;
crsbinding.$globals = crsbinding.data.addObject("globals");
crsbinding.data.globals = crsbinding.data.getValue(crsbinding.$globals);

globalThis.crsb = crsbinding;