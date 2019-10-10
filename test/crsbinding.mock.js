import {disableEvents, enableEvents} from "../src/events/event-mixin.js";
import {compileExp, releaseExp} from "../src/events/compiler.js";
import {IdleTaskManager} from "../src/idle/idleTaskManager.js";
import {ProviderManager} from "../src/binding/provider-manager.js";
import {sanitizeExp} from "../src/events/expressions.js";
import {observe, releaseObserved} from "../src/events/observer.js";
import {parseElement, releaseBinding} from "../src/binding/parse-element.js";
import {updateUI} from "../src/events/update.js";

export const crsbindingMock = {
    _expFn: new Map(),
    idleTaskManager: new IdleTaskManager(),
    enableEvents: enableEvents,
    disableEvents: disableEvents,
    providerManager: new ProviderManager(),
    compileExp: compileExp,
    releaseExp: releaseExp,
    sanitizeExp: sanitizeExp,
    observe: observe,
    releaseObserved: releaseObserved,
    parseElement: parseElement,
    releaseBinding: releaseBinding,
    updateUI: updateUI
};