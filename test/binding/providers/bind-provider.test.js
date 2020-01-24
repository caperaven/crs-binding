import {BindProvider} from "../../../src/binding/providers/bind-provider.js";
import {observe} from "../../../src/events/observer";
import {ElementMock} from "../../element.mock.js";

let instance;
let element;
let context;
let addEventListenerSpy;

beforeEach(async () => {
    global.requestAnimationFrame = (callback) => callback();

    const bindingModule = await import("./../../crsbinding.mock.js");
    global.crsbinding = bindingModule.crsbinding;

    element = new ElementMock();
    addEventListenerSpy = jest.spyOn(element, "addEventListener");

    context = observe({
        "firstName": null
    });

    instance = new BindProvider(element, context, "value", "firstName");
});

test("Bind provider - constructor", () => {
    expect(addEventListenerSpy).toHaveBeenCalled();
    expect(instance._changeHandler).not.toBeNull();
});

test("Bind provider - dispose", () => {
    const removeEventListenerSpy = jest.spyOn(element, "removeEventListener");
    instance.dispose();
    expect(removeEventListenerSpy).toHaveBeenCalled();
    expect(instance._changeHandler).toBeNull();
});

test("Bind provider - change", () => {
    const event = {
        target: new ElementMock(),
        stopPropagation: () => {}
    };
    event.target.value = "John";
    instance._change(event);

    expect(context.firstName).toBe("John");
});

test("Bind provider - number", () => {
    const numberSpy = jest.spyOn(instance, "_number");

    const event = {
        target: new ElementMock(),
        stopPropagation: () => {}
    };
    event.target.value = 10;
    event.target.type = "number";
    instance._change(event);

    expect(context.firstName).toBe(10);
    expect(numberSpy).toHaveBeenCalled();
});

test("Bind provider - date", () => {
    const _dateSpy = jest.spyOn(instance, "_date");

    const event = {
        target: new ElementMock(),
        stopPropagation: () => {}
    };
    event.target.value = new Date(2019, 1, 1);
    event.target.type = "date";
    instance._change(event);

    expect(_dateSpy).toHaveBeenCalled();
});

test ("Bind provider - checked", () => {
   const _checkedSpy = jest.spyOn(instance, "_checkbox");

   const event = {
       target: new ElementMock(),
       stopPropagation: () => {}
   };
   event.target.checked = true;
    event.target.type = "checkbox";
   instance._change(event);

   expect(_checkedSpy).toHaveBeenCalled();
});


