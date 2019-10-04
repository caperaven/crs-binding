import {compileExp, releaseExp} from "./compiler.js";

window.crsbinding = {
    _expFn: new Map(),
    compileExp: compileExp,
    releaseExp: releaseExp
};