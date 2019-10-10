import {updateUI} from "./../../src/events/update.js";

let context;
let notifyPropertyChangedSpy;

beforeEach(async () =>{
    global.window = {};
    global.crsbinding = (await import("../crsbinding.mock.js")).crsbindingMock;

    context = crsbinding.observe({
        firstName: "John"
    });

    notifyPropertyChangedSpy = jest.spyOn(context, "notifyPropertyChanged");
});

test("updateUI", () => {
   updateUI(context);
   expect(notifyPropertyChangedSpy).toHaveBeenCalled();
});