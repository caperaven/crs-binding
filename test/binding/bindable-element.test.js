let instance;
let parseElementSpy;

beforeEach(async () => {
    global.CustomEvent = class {
    };

    global.requestAnimationFrame = (callback) => callback();

    const bindingModule = await import("./../crsbinding.mock.js");
    global.crsbinding = bindingModule.crsbinding;

    global.HTMLElement = class {
    };

    global.fetch = () => {
        return new Promise(resolve => {
            resolve({
                text() {
                    return "Hello World";
                }
            })
        })
    };

    const module = await import("../../src/binding/bindable-element.js");
    class MyBind extends module.BindableElement {
        get html() {
            return "proxy takes care of this fetch";
        }

        get name() {
            return this.getProperty("name");
        }

        set name(newValue) {
            this.setProperty("name", newValue);
        }
    }

    parseElementSpy = jest.spyOn(crsbinding.parsers, "parseElements");

    instance = new MyBind();
    instance.connectedCallback();
    instance.dispatchEvent = jest.fn();
    instance.notifyPropertyChanged = jest.fn();
    instance.getAttribute = jest.fn();
});

test("bindable element - connectedCallback", async () => {
    expect(instance.innerHTML).toBe("Hello World");
    expect(parseElementSpy).toHaveBeenCalled();
    expect(instance.dispatchEvent).toBeCalled();
});

test("bindable element - disconnectedCallback", async () => {
    const releaseBinding = jest.spyOn(crsbinding.observation, "releaseBinding");

    await instance.disconnectedCallback();
    expect(releaseBinding).toHaveBeenCalled();
});

test( "bindable element - get and set property", () => {
    const name = instance.name;
    expect(instance.getAttribute).toBeCalled();

    instance.name = "John";
    expect(instance.name).toEqual("John");
});