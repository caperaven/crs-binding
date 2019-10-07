import {compileExp, releaseExp} from "./events/compiler.js";
import {enableEvents, disableEvents} from "./events/event-mixin.js";
import {observe, releaseObserved} from "./events/observer.js";
import {sanitizeExp} from "./events/expressions.js";
import {parseElement, releaseBinding} from "./binding/parse-element.js";
import {ProviderManager} from "./binding/provider-manager.js";

window.crsbinding = {
    _expFn: new Map(),
    sanitizeExp: sanitizeExp,
    compileExp: compileExp,
    releaseExp: releaseExp,
    enableEvents: enableEvents,
    disableEvents: disableEvents,
    observe: observe,
    releaseObserved: releaseObserved,
    parseElement: parseElement,
    releaseBinding: releaseBinding,
    providerManager: new ProviderManager()
};