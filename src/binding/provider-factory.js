import {BindProvider} from "./providers/bind-provider.js";
import {OneWayProvider} from "./providers/one-way-provider.js";
import {OnceProvider} from "./providers/once-provider.js";
import {CallProvider} from "./providers/call-provider.js";
import {InnerProvider} from "./providers/inner-provider.js";
import {ForProvider} from "./providers/for-provider.js";
import {IfProvider} from "./providers/if-provider.js";
import {IfClassProvider} from "./providers/if-classlist-provider.js";
import {IfStylesProvider} from "./providers/if-styles-provider.js";
import {AttrProvider} from "./providers/attr-provider.js";
import {ForOnceProvider} from "./providers/for-once-provider.js";
import {ForMapProvider} from "./providers/for-map-provider.js";
import {EmitProvider} from "./providers/emit-provider.js";
import {PostProvider} from "./providers/post-provider.js";
import {SetValueProvider} from "./providers/setvalue-provider.js";

export class ProviderFactory {
    static "bind"(element, context, property, value, ctxName, attr, parentId) {
        if (["value", "checked"].indexOf(property) != -1) {
            return new BindProvider(element, context, property, value, ctxName, parentId);
        }
        else {
            return this["one-way"](element, context, property, value, ctxName, parentId);
        }
    }

    static "two-way"(element, context, property, value, ctxName, attr, parentId) {
        return new BindProvider(element, context, property, value, ctxName, parentId);
    }

    static "one-way"(element, context, property, value, ctxName, attr, parentId) {
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
        if (attr && attr.name.indexOf(".map") != -1) {
            return new ForMapProvider(element, context, property, value, ctxName, parentId);
        }
        else if (attr && attr.name.indexOf(".once") != -1) {
            return ForOnceProvider(element, context, property, value, ctxName, parentId);
        }
        else {
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
}