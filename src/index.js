import {compileExp, releaseExp} from "./events/compiler.js";
import {enableEvents, disableEvents} from "./events/event-mixin.js";
import {observe, releaseObserved} from "./events/observer.js";
import {sanitizeExp} from "./events/expressions.js";
import {parseElement, releaseBinding} from "./binding/parse-element.js";
import {ProviderManager} from "./binding/provider-manager.js";
import {IdleTaskManager} from "./idle/idleTaskManager.js";
import {updateUI} from "./events/update.js";

window.crsbinding = {
    _expFn: new Map(),
    idleTaskManager: new IdleTaskManager(),
    sanitizeExp: sanitizeExp,
    compileExp: compileExp,
    releaseExp: releaseExp,
    providerManager: new ProviderManager(),
    updateUI: updateUI,
    enableEvents: enableEvents,
    disableEvents: disableEvents,
    observe: observe,
    releaseObserved: releaseObserved,
    releaseBinding: releaseBinding,
    parseElement: parseElement
};