import {compile} from "./compiler.js";

window.crsbinding = {
    _expFn: new Map(),
    compile: compile,
};