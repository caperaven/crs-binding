import {ViewBase} from "../../src/view/view-base.js";
import {ElementMock} from "../element.mock.js";

let instance;
let parseElementSpy;
let enableEventsSpy;
let updateUISpy;
let element;

beforeEach(async () => {
    const bindingModule = await import("./../crsbinding.mock.js");
    global.crsbinding = bindingModule.crsbinding;

    element = new ElementMock();

    parseElementSpy = jest.spyOn(crsbinding.parsers, "parseElement");
    enableEventsSpy = jest.spyOn(crsbinding.events, "enableEvents");
    updateUISpy = jest.spyOn(crsbinding.expression, "updateUI");

    instance = new ViewBase(element);
    instance.title = "Hello World";
    expect(instance.element.style.display).toBe("none");
    await instance.connectedCallback();
});

test("view base - connectedCallback", () => {
    expect(instance.isProxy).toBeTruthy();
    expect(instance.__events).not.toBeNull();
    expect(parseElementSpy).toHaveBeenCalled();
    expect(instance.element.style.display).toBe("block");
    expect(updateUISpy).toHaveBeenCalled();
    expect(instance.title).toBe("Hello World");
});

test("view base - disconnectedCallback", () => {
    const releaseBindingSpy = jest.spyOn(crsbinding.observation, "releaseBinding");
    instance.disconnectedCallback();
    expect(releaseBindingSpy).toHaveBeenCalled();
    expect(instance.__evetns).toBeUndefined();
});