import {InflationManager} from "../../src/managers/inflation-manager.js";
import {ElementMock} from "../element.mock.js";
import {DocumentMock} from "../dom-mock.js";

let instance;
let template;
let model;

async function createTemplate() {
    const bindingModule = await import("./../crsbinding.mock.js");
    global.crsbinding = bindingModule.crsbinding;
    global.document = new DocumentMock();

    template = new ElementMock("template");
    const li = new ElementMock("li", "listitem");

    const child1 = new ElementMock("div");
    child1.setAttribute("data-id", "${id}");
    child1.setAttribute("data-hidden.if","isActive == false ? 'yes' : 'no'");
    child1.setAttribute("data-desc.if", "isActive == true ? 'ready'");
    child1.innerHTML = "${id}";
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

    instance.unregister("list-item");
    expect(instance._items.get("list-item")).toBeUndefined();
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
    expect(el.children[0].getAttribute("data-hidden").value).toEqual("no");
    expect(el.children[0].getAttribute("data-desc").value).toBe("ready");
    expect(el.children[0].innerText).toEqual(model.id);

    instance.deflate("list-item", el);
    expect(el.children[0].getAttribute("data-id")).toBeUndefined();
    expect(el.children[0].getAttribute("data-hidden")).toBeUndefined();
    expect(el.children[0].getAttribute("data-desc")).toBeUndefined();
    expect(el.children[0].innerText).toEqual("");
});

test("inflation manager - check conditional value", () => {
    model.isActive = false;
    const el = template.children[0];
    instance.inflate("list-item", el, model);
    expect(el.children[0].getAttribute("data-desc")).toBeUndefined();
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

    instance.deflate("list-item", [el]);
    expect(el.children[2].style.background).toBe("");
});

test("inflation manager - get", () => {
    const data = [
        {
            id: 1,
            isActive: true,
            isReady: true
        }
    ];

    const result = instance.get("list-item", data);
    expect(result).not.toBeUndefined();
    expect(result.children.length).toBe(1);
});

test("inflation manager - get", () => {
    const result = instance.get("wrong", null);
    expect(result).toBe(null);
});
