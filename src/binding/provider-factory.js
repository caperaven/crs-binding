import {BindProvider} from "./providers/bind-provider.js";
import {OneWayProvider} from "./providers/one-way-provider.js";
import {OnceProvider} from "./providers/once-provider.js";
import {CallProvider} from "./providers/call-provider.js";
import {InnerProvider} from "./providers/inner-provider.js";
import {ForProvider} from "./providers/for-provider.js";
import {IfProvider} from "./providers/if-provider.js";

export class ProviderFactory {
    static "bind"(element, context, property, value, ctxName) {
        return new BindProvider(element, context, property, value, ctxName)
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

    static "inner"(element, context, ctxName) {
        return new InnerProvider(element, context, ctxName);
    }

    static "for"(element, context, property, value, ctxName) {
        return new ForProvider(element, context, property, value, ctxName);
    }

    static "if"(element, context, property, value, ctxName) {
        return new IfProvider(element, context, property, value, ctxName);
    }
}