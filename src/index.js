import {compileExp, releaseExp} from "./compiler.js";
import {enableEvents, disableEvents} from "./event-mixin.js";
import {sanitizeExp} from "./expressions.js";

window.crsbinding = {
    _expFn: new Map(),
    sanitizeExp: sanitizeExp,
    compileExp: compileExp,
    releaseExp: releaseExp,
    enableEvents: enableEvents,
    disableEvents: disableEvents
};