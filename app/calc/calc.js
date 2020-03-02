import {ViewBase} from "./../../src/view/view-base.js";

export default class Calc extends ViewBase {
    get duration() {
        return "00:10";
    }
    
    async connectedCallback() {
        super.connectedCallback();
        this.title = "Personal Input Form";
        
        this.start = "01:00";
        this.end = "01:20";
        //crsbinding.events.notifyPropertyChanged(this, "duration");
        crsbinding.events.notifyPropertyOn(this, "duration", ["start", "end"]);
    }
}   