import {ViewBase} from "../../src/view/view-base.js";

export default class RenderCollection extends ViewBase {
    render() {
        const data = [];
        for (let i = 0; i < 10; i++) {
            data.push({
                title: `item ${i}`,
                color: `#ff0090`
            })
        }

        const template = this._element.querySelector("template");
        crsbinding.utils.renderCollection(template, data);
    }
}