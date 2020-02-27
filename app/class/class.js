import {ViewBase} from "./../../src/view/view-base.js";

export default class ClassesBinding extends ViewBase {
    static get properties() {
        return ["title", "isActive", "myClasses"];
    }

    connectedCallback() {
        super.connectedCallback();
        this.title = "Classes Binding";
        this.isActive = true;
        this.myClasses = "blue";
        this.model = crsbinding.observation.observe({
            isActive: false
        }, this.model);
    }

    disconnectedCallback() {
        super.disconnectedCallback();
    }

    isActiveChanged() {
        this.myClasses = this.isActive == true ? "blue": ["red", "bold"];
        crsbinding.events.notifyPropertyChanged(this, "myClasses");
    }
}