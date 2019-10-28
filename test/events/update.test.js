import {updateUI} from "./../../src/events/update.js";

let context;
let notifyPropertyChangedSpy;

beforeEach(async () =>{
    global.window = {};
    global.crsbinding = (await import("../crsbinding.mock.js")).crsbindingMock;

    context = crsbinding.observation.observe({
        firstName: "John"
    });

    notifyPropertyChangedSpy = jest.spyOn(crsbinding.events, "notifyPropertyChanged");
});

test("updateUI", () => {
   updateUI(context);
   expect(notifyPropertyChangedSpy).toHaveBeenCalled();
});