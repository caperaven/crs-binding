let instance;

beforeEach(async () => {
    global.CustomEvent = class {
    };

    global.crsbinding = {
        enableEvents: jest.fn(),
        parseElement: jest.fn(),
        disableEvents: jest.fn(),
        releaseBinding: jest.fn()
    };

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
        get name() {
            return this.getProperty("name");
        }

        set name(newValue) {
            this.setProperty("name", newValue);
        }
    }

    instance = new MyBind();
    instance.dispatchEvent = jest.fn();
    instance.notifyPropertyChanged = jest.fn();
    instance.getAttribute = jest.fn();
});

test("bindable element - connectedCallback", async () => {
    await instance.connectedCallback();
    expect(instance.innerHTML).toBe("Hello World");
    expect(crsbinding.enableEvents).toBeCalled();
    expect(crsbinding.parseElement).toBeCalled();
    expect(instance.dispatchEvent).toBeCalled();
});

test("bindable element - disconnectedCallback", async () => {
    await instance.disconnectedCallback();
    expect(crsbinding.disableEvents).toBeCalled();
    expect(crsbinding.releaseBinding).toBeCalled();
});

test( "bindable element - get and set property", () => {
    const name = instance.name;
    expect(instance.getAttribute).toBeCalled();

    instance.name = "John";
    expect(instance.name).toEqual("John");
    expect(instance.notifyPropertyChanged).toBeCalled();
});