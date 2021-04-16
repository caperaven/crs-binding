import {ViewBase} from "../../src/view/view-base.js";

export default class IdleTaskManager extends ViewBase {
    setValue() {
        crsbinding.idleTaskManager.add(throwError);
        crsbinding.idleTaskManager.add(setInputValue);
    }
}

function throwError() {
    throw new Error("oops");
}

function setInputValue() {
    document.querySelector("#value").value = "Hello World";
}