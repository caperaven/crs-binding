import {ElementMock} from "../../element.mock.js";
import {ForProvider} from "../../../src/binding/providers/for-provider.js";
import {DocumentMock} from "./../../dom-mock.js";

let instance;
let element;
let context;

beforeEach(async () => {
    const bindingModule = await import("./../../crsbinding.mock.js");
    global.crsbinding = bindingModule.crsbinding;
    global.document = new DocumentMock();

    element = new ElementMock();
    element.parentElement = new ElementMock();
    element.parentElement.appendChild(element);

    context = {
        items: [
            {
                code: "A"
            }
        ]
    };

    instance = new ForProvider(element, context, "for", "item of items", null);
    const ar = crsbinding.observation.observe([]);
    instance.ar = ar;
});

test("for provider - constructor", () => {
    expect(instance._container).toBe(element.parentElement);
    expect(instance._element).toBe(element);
    expect(instance._context).toBe(context);
    expect(instance._property).toBe("for");
    expect(instance._value).toBe("item of items");
    expect(instance._itemsAddedHandler).not.toBeNull();
    expect(instance._itemsDeletedHandler).not.toBeNull();
    expect(instance._singular).toBe("item");
    expect(instance._plural).toBe("items");
    expect(instance._forExp).not.toBeNull();
    expect(instance._forExp.parameters.expression).toBe("for (item of context.items || []) {callback(item);}");
    expect(instance._collectionChangedHandler).not.toBeNull();
});

test("for provider - dispose", () => {
    instance.dispose();
    expect(instance.ar).toBeNull();
    expect(instance._element).toBeNull();
    expect(instance._context).toBeNull();
    expect(instance._property).toBeNull();
    expect(instance._value).toBeNull();
    expect(instance._itemsAddedHandler).toBeNull();
    expect(instance._itemsDeletedHandler).toBeNull();
    expect(instance._singular).toBeNull();
    expect(instance._plural).toBeNull();
    expect(instance._container).toBeNull();
    expect(instance._collectionChangedHandler).toBeNull();
});

test ("for provider - _collectionChanged", () => {
    const ar = crsbinding.observation.observe([]);
    instance._collectionChanged(null, ar);
    expect(instance.ar).toEqual(ar);
    expect(ar.__events.get("items-added")).not.toBeNull();
    expect(ar.__events.get("items-deleted")).not.toBeNull();

    instance.ar = null;
    expect(instance._ar).toBeNull();
    expect(ar.__events.get("items-added")).toBeUndefined();
    expect(ar.__events.get("items-deleted")).toBeUndefined();
});

test ("for provider - items added", () => {
    const added = {
        items: [{code: "B"}],
        indexes: [1]
    };

    instance.createElement = () => (new ElementMock()).appendChild(new ElementMock());
    instance._itemsAdded(null, null, added);
});

test ("for provider - items deleted", () => {
    const removed = {code: "B"};
    instance._itemsDeleted(null, null, removed);
});