import {SetValueProvider} from "./../binding/providers/setvalue-provider.js";

crsbinding.providerManager.factory.setvalue = function(element, context, property, value, ctxName, attr, parentId) {
    return new SetValueProvider(element, context, property, value, ctxName, parentId);
}
