import {BindableElement} from "../../src/binding/bindable-element.js";

class TasksSummary extends BindableElement{
    get html() {
        return import.meta.url.replace(".js", ".html");
    }

    get parent() {
        return this.getProperty("parent");
    }

    set parent(newValue) {
        this.setProperty("parent", newValue);
        this.taskCount = newValue.tasks.length;
    }

    get taskCount() {
        return this.getProperty("taskCount");
    }

    set taskCount(newValue) {
        this.setProperty("taskCount", newValue);
    }

    async connectedCallback() {
        super.connectedCallback();
    }
}

customElements.define("tasks-summary", TasksSummary);