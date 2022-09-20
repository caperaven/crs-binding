class SvgGroup extends crsbinding.classes.SvgElement {
    async connectedCallback() {
        await super.connectedCallback();
    }

    async disconnectedCallback() {

    }
}

crsbinding.svgCustomElements.define("svg-group", SvgGroup);