import {createListItem} from "./svg-list-item.js";
import {createElement} from "./element-factory.js";

class SvgList extends crsbinding.classes.SvgElement {
    async connectedCallback() {
        await super.connectedCallback();
        await this._drawList([
            {
                title: "Item 1",
                textPosition: "translate(10, 10)",
                circlePosition: "translate(100, 10)"
            },
            {
                title: "Item 2",
                textPosition: "translate(10, 10)",
                circlePosition: "translate(100, 10)"
            },
            {
                title: "Item 3",
                textPosition: "translate(10, 10)",
                circlePosition: "translate(100, 10)"
            }
        ])
    }

    async disconnectedCallback() {

    }

    async _drawList(array) {
        const background = createElement("rect", {width: 200, height: 100, fill: "white", r: 10});
        this.element.appendChild(background);

        for (let index = 0; index < array.length; index++) {
            const item = createListItem(array[index].title, true, 200, 8, index);
            this.element.appendChild(item);
        }
    }
}

crsbinding.svgCustomElements.define("svg-list", SvgList);