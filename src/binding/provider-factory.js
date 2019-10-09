import {BindProvider} from "./providers/bind-provider.js";
import {OneWayProvider} from "./providers/one-way-provider.js";
import {OnceProvider} from "./providers/once-provider.js";
import {WhenProvider} from "./providers/when-provider.js";
import {CallProvider} from "./providers/call-provider.js";

export class ProviderFactory {
    static "bind"(element, context, property, value) {
        return new BindProvider(element, context, property, value)
    }

    static "two-way"(element, context, property, value) {
        return this.bind(element, context, property, value);
    }

    static "one-way"(element, context, property, value) {
        return new OneWayProvider(element, context, property, value);
    }

    static "once"(element, context, property, value) {
        return OnceProvider(element, context, property, value);
    }

    static "when"(element, context, property, value) {
        return new WhenProvider(element, context, property, value);
    }

    static "call"(element, context, property, value) {
        return new CallProvider(element, context, property, value);
    }
}