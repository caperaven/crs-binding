import {InflationManager} from "./../../src/binding/inflation-manager.js";
import {ElementMock} from "../element.mock.js";

let instance;
let template;

async function createTemplate() {
    const bindingModule = await import("./../crsbinding.mock.js");
    global.crsbinding = bindingModule.crsbinding;

    template = new ElementMock("template");

    const li = new ElementMock("li", "listitem");
    li.setAttribute("data-id", "${id}");

    template.appendChild(li);
}

beforeEach(async () => {
    instance = new InflationManager();
    await createTemplate();
});

test("inflation manger - constructor", () => {
    expect(instance._items).not.toBeUndefined();
});

test("inflation manger - dispose", () => {
    instance.dispose();
    expect(instance._items).toBeNull();
});

test("inflation manager - register", () => {
    instance.register("list-item", template);
    const gen = instance._items.get("list-item");

    expect(gen).not.toBeUndefined();
    expect(gen.template).not.toBeUndefined();
    expect(gen.inflate).not.toBeUndefined();
    expect(gen.deflate).not.toBeUndefined();

    const el = template.children[0];
    instance.inflate("list-item", el, {id: 10});
    expect(el.getAttribute("data-id").value).toEqual(10);

    instance.deflate("list-item", el);
    expect(el.getAttribute("data-id")).toBeUndefined();
});