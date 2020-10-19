import {EmitProvider} from "./../binding/providers/emit-provider.js";
import {PostProvider} from "./../binding/providers/post-provider.js";
import {EventEmitter} from "./../events/events.js";

crsbinding.providerManager.factory.emit = function(element, context, property, value, ctxName, attr, parentId) {
    return new EmitProvider(element, context, property, value, ctxName, parentId);
}

crsbinding.providerManager.factory.post = function(element, context, property, value, ctxName, attr, parentId) {
    return new PostProvider(element, context, property, value, ctxName, parentId);
}

crsbinding.events.emitter = new EventEmitter();
