import {ViewBase} from "./../../src/view/view-base.js";

export default class StyleBinding extends ViewBase {
    static get properties() {
        return ["title", "isActive"];
    }

    connectedCallback() {
        super.connectedCallback();
        this.title = "Style Binding";
        this.isActive = true;
        this.background = "blue";
        this.color = "yellow";
        this.model = crsbinding.observation.observe({
            color: "#ff0000"
        });
    }

    disconnectedCallback() {
        super.disconnectedCallback();
    }

    isActiveChanged() {
        this.background = this.isActive == true ? "blue" : "red";
        this.color = this.isActive == true ? "yellow" : "white";
        crsbinding.events.notifyPropertyChanged(this, "background");
        crsbinding.events.notifyPropertyChanged(this, "color");
    }

    updateColor() {
        this.model.color = "#FFBB00";
    }
}