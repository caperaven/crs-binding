import {ViewBase} from "../../src/view/view-base.js";

export default class RenderCollection extends ViewBase {
    updateUI(data) {
        const template = this._element.querySelector("template");
        const parent = document.querySelector("#parent-collection");
        let elements = parent.childElementCount == 0 ? null : parent.children;
        crsbinding.utils.renderCollection(template, data, elements, parent);
    }

    render() {
        this.updateUI(getData(10));
    }

    renderMore() {
        this.updateUI(getData(15));
    }

    renderLess() {
        this.updateUI(getData(5));
    }
}

function getData(count) {
    const data = [];
    for (let i = 0; i < count; i++) {
        const value = getRndInteger(0, 100);

        data.push({
            title: `item ${i} - ${value}`,
            color: `#ff0090`
        })
    }
    return data;
}

function getRndInteger(min, max) {
    return Math.floor(Math.random() * (max - min) ) + min;
}
