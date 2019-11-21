import {updateUI} from "./../../src/events/update.js";

let context;
let notifyPropertyChangedSpy;

beforeEach(async () =>{
    const bindingModule = await import("./../crsbinding.mock.js");
    global.crsbinding = bindingModule.crsbinding;

    context = crsbinding.observation.observe({
        firstName: "John"
    });

    notifyPropertyChangedSpy = jest.spyOn(crsbinding.events, "notifyPropertyChanged");
});

test("updateUI", () => {
   updateUI(context);
   expect(notifyPropertyChangedSpy).toHaveBeenCalled();
});