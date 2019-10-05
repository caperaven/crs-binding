import {BindProvider} from "./providers/bind-provider.js";
import {OneWayProvider} from "./providers/one-way-provider.js";
import {OnceProvider} from "./providers/once-provider.js";
import {WhenProvider} from "./providers/when-provider.js";
import {CallProvider} from "./providers/call-provider.js";

export class ProviderFactory {
    static "bind"() {
        return new BindProvider()
    }

    static "two-way"() {
        return this.bind();
    }

    static "one-way"() {
        return new OneWayProvider();
    }

    static "once"() {
        return new OnceProvider();
    }

    static "when"() {
        return new WhenProvider();
    }

    static "call"() {
        return new CallProvider();
    }
}