import {IfClassProvider} from "./../binding/providers/if-classlist-provider.js";
import {IfStylesProvider} from "./../binding/providers/if-styles-provider.js";
import {IfProvider} from "./../binding/providers/if-provider.js";

crsbinding.providerManager.factory.if = function(element, context, property, value, ctxName, attr,  parentId) {
    if (property.toLowerCase() == "classlist") {
        return new IfClassProvider(element, context, property, value, ctxName, parentId);
    }

    if (property.toLowerCase().indexOf("style.") != -1) {
        return new IfStylesProvider(element, context, property, value, ctxName, parentId);
    }

    return new IfProvider(element, context, property, value, ctxName, parentId);
}
