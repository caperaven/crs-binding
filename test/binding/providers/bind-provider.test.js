import {BindProvider} from "../../../src/binding/providers/bind-provider.js";
import {observe} from "../../../src/events/observer";
import {ElementMock} from "../../element.mock.js";

let instance;
let element;
let context;

beforeEach(async () => {
    global.window = {};

    const crsbindingModule = await import("./../../crsbinding.mock.js");

    global.crsbinding = crsbindingModule.crsbindingMock;

    element = new ElementMock();

    context = observe({
        "firstName": null
    });

    instance = new BindProvider(element, context, "value", "firstName");
});

test("Bind provider - constructor", () => {
    expect(element.addEventListenerSpy).toHaveBeenCalled();
    expect(instance._changeHandler).not.toBeNull();
});

test("Bind provider - dispose", () => {
    instance.dispose();
    expect(element.removeEventListenerSpy).toHaveBeenCalled();
    expect(instance._changeHandler).toBeNull();
});

test("Bind provider - change", () => {
    const event = {
        target: new ElementMock()
    };
    event.target.value = "John";
    instance._change(event);

    expect(context.firstName).toBe("John");
});

test("Bind provider - number", () => {
    const numberSpy = jest.spyOn(instance, "_number");

    const event = {
        target: new ElementMock()
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
        target: new ElementMock()
    };
    event.target.value = new Date(2019, 1, 1);
    event.target.type = "date";
    instance._change(event);

    expect(_dateSpy).toHaveBeenCalled();
});


