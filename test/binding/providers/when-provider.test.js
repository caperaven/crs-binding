import {WhenProvider} from "./../../../src/binding/providers/when-provider.js";
import {ElementMock} from "../../element.mock.js";
import {observe} from "../../../src/events/observer.js";

let instance;
let instanceAttr;
let element;
let context;
let onSpy;
let removeOnSpy;
let releaseExpSpy;
let idleTaskManagerSpy;
let expObjSpy;

beforeEach(async ()=> {
    const bindingModule = await import("./../../crsbinding.mock.js");
    global.window = {};
    global.crsbinding = bindingModule.crsbinding;

    element = new ElementMock();

    context = observe({
        "firstName": null
    });

    onSpy = jest.spyOn(crsbinding.events, "on");
    removeOnSpy = jest.spyOn(crsbinding.events, "removeOn");
    releaseExpSpy = jest.spyOn(crsbinding.expression, "release");
    idleTaskManagerSpy = jest.spyOn(crsbinding.idleTaskManager, "add");

    instance = new WhenProvider(element, context, "value", "firstName == 'John' ? true : false");
    instanceAttr = new WhenProvider(element, context, "data-name", "firstName == 'John' ? true : false");

    expObjSpy = jest.spyOn(instance._expObj, "function");
});

test("when provider - construct", () => {
    expect(instance._exp).toBe('element["value"] = value');
    expect(instanceAttr._exp).toBe('element.setAttribute("data-name", value)');
    expect(instance._expObj).not.toBeNull();
    expect(instance._condition).toBe("firstName == 'John'");
    expect(instance._getValueFn).not.toBeNull();
    expect(onSpy).toHaveBeenCalled();
});

test("when provider - dispose", () => {
    instance.dispose();

    expect(removeOnSpy).toHaveBeenCalled();
    expect(releaseExpSpy).toHaveBeenCalled();

    expect(instance._eventHandler).toBeNull();
    expect(instance._exp).toBeNull();
    expect(instance._condition).toBeNull();
    expect(instance._expObj).toBeUndefined();
    expect(instance._getValueFn).toBeUndefined();
});

test("when provider - when", () => {
    instance._when();
    expect(idleTaskManagerSpy).toHaveBeenCalled();
    expect(expObjSpy).toHaveBeenCalled();
});