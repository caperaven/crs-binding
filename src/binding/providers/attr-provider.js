import {InnerProvider} from "./inner-provider.js";

export class AttrProvider extends InnerProvider {
    _change() {
        if (this._expObj == null) return;
        const value = this._expObj.function(this._context);
        this._element.setAttribute(this._property, value);
    }
}