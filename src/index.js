import {compileExp, releaseExp} from "./events/compiler.js";
import {enableEvents, disableEvents} from "./events/event-mixin.js";
import {observe, releaseObserved} from "./events/observer.js";
import {sanitizeExp} from "./events/expressions.js";
import {parseElement, parseElements, releaseBinding} from "./binding/parse-element.js";
import {ProviderManager} from "./binding/provider-manager.js";
import {IdleTaskManager} from "./idle/idleTaskManager.js";
import {updateUI} from "./events/update.js";
import {when, on, notifyPropertyChanged, removeOn, removeWhen} from "./events/event-mixin.js";
import {listenOn, listenOnPath} from "./binding/listen-on.js";

const crsbinding = {
    _expFn: new Map(),
    idleTaskManager: new IdleTaskManager(),
    providerManager: new ProviderManager(),

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
        removeOn: removeOn,
        removeWhen: removeWhen,
        listenOn: listenOn,
        listenOnPath: listenOnPath
    }
};

window.crsbinding = crsbinding;

export {
    crsbinding
};