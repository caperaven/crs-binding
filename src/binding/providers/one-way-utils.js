import {setClassList, setDataset, setElementProperty, setElementValueProperty} from "./code-constants.js";
import {setElementCleanupProperty} from "./../../lib/utils.js";

export function getExpForProvider(provider) {
    let result;

    if (provider._property.toLocaleLowerCase() == "classlist") {
        return setClassList;
    }

    if (provider._property.indexOf("data-") != -1) {
        const prop = provider._property.replace("data-", "");
        return setDataset.split("__property__").join(prop);
    }

    result = provider._property == "value" || provider._property == "placeholder" ? setElementValueProperty : setElementProperty;
    provider._property = crsbinding.utils.capitalizePropertyPath(provider._property);

    return result.split("__property__").join(provider._property);
}

export function setContext(element, property, context) {
    if (element != null && property != null) {
        const fn = () => {
            element.removeEventListener("ready", fn);
            setElementCleanupProperty(element, property, crsbinding.data.getValue(context));
        };

        if (element.isReady == true) {
            fn();
        }
        else {
            element.addEventListener("ready", fn);
        }
    }
}
