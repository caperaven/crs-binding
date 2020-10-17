import {BindProvider} from "./providers/bind-provider.js";
import {OneWayProvider} from "./providers/one-way-provider.js";
import {OneWayStringProvider} from "./providers/one-way-string-provider.js";
import {OnceProvider} from "./providers/once-provider.js";
import {CallProvider} from "./providers/call-provider.js";
import {InnerProvider} from "./providers/inner-provider.js";
import {ForProvider} from "./providers/for-provider.js";

export class ProviderFactory {
    bind(element, context, property, value, ctxName, attr, parentId) {
        if (["value", "checked"].indexOf(property) != -1) {
            return new BindProvider(element, context, property, value, ctxName, parentId);
        }
        else {
            return this["one-way"](element, context, property, value, ctxName, parentId);
        }
    }

    "two-way"(element, context, property, value, ctxName, attr, parentId) {
        return new BindProvider(element, context, property, value, ctxName, parentId);
    }

    "one-way"(element, context, property, value, ctxName, attr, parentId) {
        if (value[0] == "`") {
            return new OneWayStringProvider(element, context, property, value, ctxName, parentId)
        }
        return new OneWayProvider(element, context, property, value, ctxName, parentId);
    }

    once(element, context, property, value, ctxName, attr, parentId) {
        return OnceProvider(element, context, property, value, ctxName, parentId);
    }

    call(element, context, property, value, ctxName, attr, parentId) {
        return new CallProvider(element, context, property, value, ctxName, parentId);
    }

    delegate(element, context, property, value, ctxName, attr, parentId) {
        return new CallProvider(element, context, property, value, ctxName, parentId);
    }

    inner(element, context, property, value, ctxName, attr, parentId) {
        return new InnerProvider(element, context, property, value, ctxName, parentId);
    }

    for(element, context, property, value, ctxName, attr, parentId) {
        const parts = attr.name.split(".");

        const customProvider = parts.length > 1 ? crsbinding.providerManager.providers.for[parts[1]] : null;

        if (customProvider != null) {
            return new customProvider(element, context, property, value, ctxName, parentId);
        } else {
            return new ForProvider(element, context, property, value, ctxName, parentId);
        }
    }
}