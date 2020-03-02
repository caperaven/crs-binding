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

export class ProviderFactory {
    static "bind"(element, context, property, value, ctxName) {
        if (["value", "checked"].indexOf(property) != -1) {
            return new BindProvider(element, context, property, value, ctxName)
        }
        else {
            return this["one-way"](element, context, property, value, ctxName);
        }
    }

    static "two-way"(element, context, property, value, ctxName) {
        return this.bind(element, context, property, value, ctxName);
    }

    static "one-way"(element, context, property, value, ctxName) {
        return new OneWayProvider(element, context, property, value, ctxName);
    }

    static "once"(element, context, property, value, ctxName) {
        return OnceProvider(element, context, property, value, ctxName);
    }

    static "call"(element, context, property, value, ctxName) {
        return new CallProvider(element, context, property, value, ctxName);
    }

    static "delegate"(element, context, property, value, ctxName) {
        return new CallProvider(element, context, property, value, ctxName);
    }

    static "inner"(element, context, property, value, ctxName) {
        return new InnerProvider(element, context, property, value, ctxName);
    }

    static "for"(element, context, property, value, ctxName, attr) {
        if (attr.name.indexOf(".once") != -1) {
            return ForOnceProvider(element, context, property, value, ctxName);
        }
        else {
            return new ForProvider(element, context, property, value, ctxName);
        }
    }

    static "if"(element, context, property, value, ctxName) {
        if (property.toLowerCase() == "classlist") {
            return new IfClassProvider(element, context, property, value, ctxName);
        }

        if (property.toLowerCase().indexOf("style.") != -1) {
            return new IfStylesProvider(element, context, property, value, ctxName);
        }

        return new IfProvider(element, context, property, value, ctxName);
    }

    static "attr"(element, context, property, value, ctxName) {
        return new AttrProvider(element, context, property, value, ctxName);
    }
}