import {ViewBase} from "./../../src/view/view-base.js";
import "./text-properties.js";

export default class ListItem extends ViewBase {
    get model() {
        return this.getProperty("model");
    }
    
    set model(newValue) {
        this.setProperty("model", newValue);
    }
    
    async connectedCallback() {
        super.connectedCallback();
        this.title = "List Item Bind Example";
        this.items = getData(10);
    }

    async disconnectedCallback() {
        super.disconnectedCallback();
        this.model = null;
        crsbinding.observation.releaseObserved(this.items, true);
    }
    
    _click(e) {
        if (this[e.target.dataset.call]) {
            this[e.target.dataset.call](e);    
        } 
    }   
    
    itemClicked(e) {
        const item = this.items.find(_=> _.id === Number(e.target.dataset.id));
        this.model = item;
    }
}

function getData() {
    
    let result = [
        {
        id: 1,
        caption: `Item 1`,
        isActive: false,
        fontColour: "#ff0000",
        backgroundColour: "#0000ff"
        },
        {
            id: 2,
            caption: `Item 2`,
            isActive: false,
            fontColour: "#111216",
            backgroundColour: "#ff794f" 
        },
        {
            id: 3,
            caption: `Item 3`,
            isActive: false,
            fontColour: "#4384bb",
            backgroundColour: "#04ff43"
        },
        {
            id: 4,
            caption: `Item 4`,
            isActive: false,
            fontColour: "#58bb9d",
            backgroundColour: "#ff47f0"
        }
    ];
    
    return crsbinding.observation.observe(result, null, true);
}