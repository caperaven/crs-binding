import {compileExp} from "./compiler.js";

window.crsbinding = {
    _expFn: new Map(),
    compile: compileExp,
};