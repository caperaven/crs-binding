import {AttrProvider} from "./../binding/providers/attr-provider.js";

crsbinding.providerManager.factory.attr = function(element, context, property, value, ctxName, attr, parentId) {
    return new AttrProvider(element, context, property, value, ctxName, parentId);
}
