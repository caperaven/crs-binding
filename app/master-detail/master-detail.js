import {ViewBase} from "../../src/view/view-base.js";

export default class MasterDetail extends ViewBase {
    preLoad() {
        this.setProperty("items", [
            {
                id: 0,
                title: "Item 1",
                paragraph: "Hello to item 1"
            },
            {
                id: 1,
                title: "Item 2",
                paragraph: "Hello to item 2"
            },
            {
                id: 2,
                title: "Item 3",
                paragraph: "Hello to item 3"
            }
        ]);
    }

}