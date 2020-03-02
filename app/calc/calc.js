import {ViewBase} from "./../../src/view/view-base.js";

export default class Calc extends ViewBase {
    get duration() {
        const startS = this._durToSec(this.start);
        const endS = this._durToSec(this.end);

        const result = endS - startS;
        return this._secToDur(result);
    }
    
    async connectedCallback() {
        this.title = "Personal Input Form";
        this.start = "01:00";
        this.end = "01:20";

        super.connectedCallback();
        crsbinding.events.notifyPropertyOn(this, "duration", ["start", "end"]);
    }

    _durToSec(value) {
        const parts = value.split(":");
        const hours = Number.parseInt(parts[0].trim());
        const min = Number.parseInt(parts[1].trim());
        return min + hours * 60;
    }

    _secToDur(value) {
        const hours = value < 60 ? 0 : value / 60;
        const min = value - hours;
        return `${hours < 10 ? "0" : ""}${hours}:${min < 10 ? "0": ""}${min}`;
    }
}   