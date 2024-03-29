import {compileExp, releaseExp, AsyncFunction} from "./events/compiler.js";
import {sanitizeExp} from "./expressions/exp-sanitizer.js";
import {parseElement, parseElements, releaseBinding, releaseChildBinding, parseHTMLFragment} from "./binding/parse-element.js";
import {ProviderManager} from "./managers/provider-manager.js";
import {IdleTaskManager} from "./idle/idleTaskManager.js";
import {listenOnPath, removeOnPath} from "./binding/listen-on.js";
import {domEnableEvents, domDisableEvents} from "./events/dom-events.js";
import {InflationManager} from "./managers/inflation-manager.js";
import {clone} from "./lib/clone.js";
import {BindingData} from "./store/binding-data.js";
import {EventEmitter} from "./events/event-emitter.js";
import {RepeatBaseProvider} from "./binding/providers/repeat-base-provider.js";
import {BindableElement} from "./binding/bindable-element.js";
import {PerspectiveElement} from "./binding/perspective-element.js";
import {ViewBase} from "./view/view-base.js";
import {Widget} from "./view/crs-widget.js";
import {ElementStoreManager} from "./managers/element-store-manager.js";
import {ValueConvertersManager} from "./managers/value-converters-manager.js";
import {measureElement, fragmentToText, disposeProperties, cloneTemplate, relativePathFrom, getPathOfFile, flattenPropertyPath} from "./lib/utils.js";
import {forceClean} from "./lib/cleanMemory.js";
import {renderCollection} from "./lib/renderCollection.js";
import {getValueOnPath} from "./lib/path-utils.js";
import {SvgElementsManager} from "./managers/svg-elements-manager.js";
import {SvgElement} from "./view/svg-element.js";
import {unloadTemplates, unloadAllTemplates, addTemplate, getTemplate, loadTemplate, loadFromElement, getTemplateById} from "./store/templates.js";
import {TranslationsManager} from "./managers/translations-manager.js";
import {getConverterParts} from "./lib/converter-parts.js";
import {StaticInflationManager} from "./managers/static-inflation-manager.js"
import {ifFunction, caseFunction} from "./expressions/exp-functions.js";

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
    staticInflationManager: new StaticInflationManager(),
    elementStoreManager: new ElementStoreManager(),
    svgCustomElements: new SvgElementsManager(),
    valueConvertersManager: new ValueConvertersManager(),
    translations: new TranslationsManager(),

    expression: {
        sanitize: sanitizeExp,
        compile: compileExp,
        release: releaseExp,
        ifFunction: ifFunction,
        caseFunction: caseFunction
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
        PerspectiveElement: PerspectiveElement,
        ViewBase: ViewBase,
        RepeatBaseProvider: RepeatBaseProvider,
        Widget: Widget,
        SvgElement: SvgElement,
        AsyncFunction: AsyncFunction
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
        getValueOnPath: getValueOnPath,
        flattenPropertyPath: flattenPropertyPath,
        getConverterParts: getConverterParts
    },

    templateProviders: {
        keys: [],
        items: {},

        add: (key, fn) => {
            crsbinding.templateProviders.keys.push(key);
            crsbinding.templateProviders.items[key] = fn;
        }
    },

    templates: {
        data: {},
        load: loadTemplate,
        add: addTemplate,
        get: getTemplate,
        unload: unloadTemplates,
        unloadAll: unloadAllTemplates,
        loadFromElement: loadFromElement,
        getById: getTemplateById
    }
};

globalThis.crsbinding = crsbinding;
crsbinding.$globals = crsbinding.data.addObject("globals");
crsbinding.data.globals = crsbinding.data.getValue(crsbinding.$globals);

crsbinding.templateProviders.add("src", parseHTMLFragment);

globalThis.crsb = crsbinding;