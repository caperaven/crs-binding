import {BindProvider} from "./providers/bind-provider.js";
import {OneWayProvider} from "./providers/one-way-provider.js";
import {OneWayStringProvider} from "./providers/one-way-string-provider.js";
import {OnceProvider} from "./providers/once-provider.js";
import {CallProvider} from "./providers/call-provider.js";
import {InnerProvider} from "./providers/inner-provider.js";
import {ForProvider} from "./providers/for-provider.js";
import {IfProvider} from "./providers/if-provider.js";
import {IfClassProvider} from "./providers/if-classlist-provider.js";
import {IfStylesProvider} from "./providers/if-styles-provider.js";
import {AttrProvider} from "./providers/attr-provider.js";
import {EmitProvider} from "./providers/emit-provider.js";
import {PostProvider} from "./providers/post-provider.js";
import {SetValueProvider} from "./providers/setvalue-provider.js";
import {ProcessProvider} from "./providers/process-provider.js";
import {DatasetProvider} from "./providers/dataset-provider.js";

export class ProviderFactory {
    static "bind"(element, context, property, value, ctxName, attr, parentId) {
        if (["value", "checked"].indexOf(property) != -1) {
            return new BindProvider(element, context, property, value, ctxName, parentId);
        }
        else {
            return this["one-way"](element, context, property, value, ctxName, parentId);
        }
    }

    static "dataset"(element, context, property, value, ctxName, attr, parentId) {
        return new DatasetProvider(element, context, property, value, ctxName, parentId);
    }

    static "two-way"(element, context, property, value, ctxName, attr, parentId) {
        return new BindProvider(element, context, property, value, ctxName, parentId);
    }

    static "one-way"(element, context, property, value, ctxName, attr, parentId) {
        if (value[0] == "`") {
            return new OneWayStringProvider(element, context, property, value, ctxName, parentId)
        }
        return new OneWayProvider(element, context, property, value, ctxName, parentId);
    }

    static "once"(element, context, property, value, ctxName, attr, parentId) {
        return OnceProvider(element, context, property, value, ctxName, parentId);
    }

    static "call"(element, context, property, value, ctxName, attr, parentId) {
        return new CallProvider(element, context, property, value, ctxName, parentId);
    }

    static "delegate"(element, context, property, value, ctxName, attr, parentId) {
        return new CallProvider(element, context, property, value, ctxName, parentId);
    }

    static "emit"(element, context, property, value, ctxName, attr, parentId) {
        return new EmitProvider(element, context, property, value, ctxName, parentId);
    }

    static "post"(element, context, property, value, ctxName, attr, parentId) {
        return new PostProvider(element, context, property, value, ctxName, parentId);
    }

    static "setvalue"(element, context, property, value, ctxName, attr, parentId) {
        return new SetValueProvider(element, context, property, value, ctxName, parentId);
    }

    static "inner"(element, context, property, value, ctxName, attr, parentId) {
        return new InnerProvider(element, context, property, value, ctxName, parentId);
    }

    static "for"(element, context, property, value, ctxName, attr, parentId) {
        const parts = attr.name.split(".");

        const customProvider = parts.length > 1 ? crsbinding.providerManager.providers.for[parts[1]] : null;

        if (customProvider != null) {
            return new customProvider(element, context, property, value, ctxName, parentId);
        } else {
            return new ForProvider(element, context, property, value, ctxName, parentId);
        }
    }

    static "if"(element, context, property, value, ctxName, attr,  parentId) {
        if (property.toLowerCase() == "classlist") {
            return new IfClassProvider(element, context, property, value, ctxName, parentId);
        }

        if (property.toLowerCase().indexOf("style.") != -1) {
            return new IfStylesProvider(element, context, property, value, ctxName, parentId);
        }

        return new IfProvider(element, context, property, value, ctxName, parentId);
    }

    static "attr"(element, context, property, value, ctxName, attr, parentId) {
        return new AttrProvider(element, context, property, value, ctxName, parentId);
    }

    static "process"(element, context, property, value, ctxName, attr, parentId) {
        return new ProcessProvider(element, context, property, value, ctxName, parentId);
    }
}