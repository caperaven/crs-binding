import {disableEvents, enableEvents} from "../src/events/event-mixin.js";
import {compileExp, releaseExp} from "../src/events/compiler.js";
import {IdleTaskManager} from "../src/idle/idleTaskManager.js";
import {ProviderManager} from "../src/binding/provider-manager.js";

export const crsbindingMock = {
    _expFn: new Map(),
    idleTaskManager: new IdleTaskManager(),
    enableEvents: enableEvents,
    disableEvents: disableEvents,
    providerManager: new ProviderManager(),
    compileExp: compileExp,
    releaseExp: releaseExp,
};