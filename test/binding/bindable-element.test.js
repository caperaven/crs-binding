let instance;

beforeEach(async () => {
    global.CustomEvent = class {
    };

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
        get name() {
            return this.getProperty("name");
        }

        set name(newValue) {
            this.setProperty("name", newValue);
        }
    }

    instance = new MyBind();
    instance.connectedCallback();
    instance.dispatchEvent = jest.fn();
    instance.notifyPropertyChanged = jest.fn();
    instance.getAttribute = jest.fn();
});

test("bindable element - connectedCallback", async () => {
    const enableEventsSpy = jest.spyOn(crsbinding.events, "enableEvents");
    const parseElementSpy = jest.spyOn(crsbinding.parsers, "parseElements");

    await instance.connectedCallback();
    expect(instance.innerHTML).toBe("Hello World");
    expect(enableEventsSpy).toHaveBeenCalled();
    expect(parseElementSpy).toHaveBeenCalled();
    expect(instance.dispatchEvent).toBeCalled();
});

test("bindable element - disconnectedCallback", async () => {
    const disableEventsSpy = jest.spyOn(crsbinding.events, "disableEvents");
    const releaseBinding = jest.spyOn(crsbinding.observation, "releaseBinding");

    await instance.disconnectedCallback();
    expect(disableEventsSpy).toHaveBeenCalled();
    expect(releaseBinding).toHaveBeenCalled();
});

test( "bindable element - get and set property", () => {
    let notifyPropertyChangedSpy = jest.spyOn(crsbinding.events, "notifyPropertyChanged");

    const name = instance.name;
    expect(instance.getAttribute).toBeCalled();

    instance.name = "John";
    expect(instance.name).toEqual("John");
    expect(notifyPropertyChangedSpy).toHaveBeenCalled();
});