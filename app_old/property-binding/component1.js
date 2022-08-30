export class Component1 extends HTMLElement {
    get datasource() {
        return this._datasource;
    }

    set datasource(newValue) {
        this._datasource = newValue;
        this.textContent = newValue.name;
    }

    connectedCallback() {
        this.textContent = "Hello World";
    }
}

customElements.define("component-1", Component1);