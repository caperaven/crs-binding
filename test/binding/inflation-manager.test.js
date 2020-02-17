import {InflationManager} from "./../../src/binding/inflation-manager.js";
import {ElementMock} from "../element.mock.js";

let instance;
let template;
let model;

async function createTemplate() {
    const bindingModule = await import("./../crsbinding.mock.js");
    global.crsbinding = bindingModule.crsbinding;

    template = new ElementMock("template");
    const li = new ElementMock("li", "listitem");

    const child1 = new ElementMock("div");
    child1.setAttribute("data-id", "${id}");
    li.appendChild(child1);

    const child2 = new ElementMock("div");
    child2.setAttribute("classlist.if", "isReady == true ? 'ready' : 'notReady'");
    li.appendChild(child2);

    const child3 = new ElementMock("div");
    child3.setAttribute("style.background.if", "isActive == true ? 'green' : 'red'");
    li.appendChild(child3);


    template.appendChild(li);

    instance.register("list-item", template);

    model = {
        id: 10,
        isActive: true,
        isReady: true
    }
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
    const gen = instance._items.get("list-item");

    expect(gen).not.toBeUndefined();
    expect(gen.template).not.toBeUndefined();
    expect(gen.inflate).not.toBeUndefined();
    expect(gen.deflate).not.toBeUndefined();
});

test("inflation manager - check attribute value", () => {
    const el = template.children[0];
    instance.inflate("list-item", el, model);
    expect(el.children[0].getAttribute("data-id").value).toEqual(model.id);

    instance.deflate("list-item", el);
    expect(el.children[0].getAttribute("data-id")).toBeUndefined();
});

test("inflation manager - check classlist", () => {
    const el = template.children[0];
    instance.inflate("list-item", el, model);
    expect(el.children[1].classList.contains("ready")).toBeTruthy();

    instance.deflate("list-item", el);
    expect(el.children[1].classList.length).toBe(0);
});

test("inflation manager - check classlist false", () => {
    model.isReady = false;
    const el = template.children[0];
    instance.inflate("list-item", el, model);
    expect(el.children[1].classList.contains("notReady")).toBeTruthy();

    instance.deflate("list-item", el);
    expect(el.children[1].classList.length).toBe(0);
});

test("inflation manager - check style", () => {
    const el = template.children[0];
    instance.inflate("list-item", el, model);
    expect(el.children[2].style.background).toBe("green");

    instance.deflate("list-item", el);
    expect(el.children[2].style.background).toBe("");
});

test("inflation manager - check style", () => {
    model.isActive = false;
    const el = template.children[0];
    instance.inflate("list-item", el, model);
    expect(el.children[2].style.background).toBe("red");

    instance.deflate("list-item", el);
    expect(el.children[2].style.background).toBe("");
});
