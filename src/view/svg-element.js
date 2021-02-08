export class SvgElement {
    constructor(element) {
        this.element = element;
    }

    dispose() {
        this.element = null;
    }

    async connectedCallback() {
    }

    async suspend() {

    }

    async restore() {

    }
}