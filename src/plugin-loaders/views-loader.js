import {BindableElement} from "../binding/bindable-element.js";
import {ViewBase} from "../view/view-base.js";
import {Widget} from "../view/crs-widget.js";
import {domDisableEvents, domEnableEvents} from "../events/dom-events.js";

crsbinding.dom = {
    enableEvents: domEnableEvents,
    disableEvents: domDisableEvents,
};

crsbinding.classes = crsbinding.classes || {};
crsbinding.classes.BindableElement = BindableElement;
crsbinding.classes.ViewBase = ViewBase;
crsbinding.classes.Widget = Widget;