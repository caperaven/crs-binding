import {stringResultConverter} from "./../../value-converters/string-result.js";
import {dayOfWeekConverter} from "./../../value-converters/day-of-week.js";
import {dateToIso} from "./../../value-converters/date-iso.js";
import {alphaNumericConverter} from "./../../value-converters/alphaNumeric.js";

export default class ValueConverters extends crsbinding.classes.ViewBase {
    preLoad() {
        crsbinding.valueConvertersManager.add("string", stringResultConverter);
        crsbinding.valueConvertersManager.add("day", dayOfWeekConverter);
        crsbinding.valueConvertersManager.add("date", dateToIso);
        crsbinding.valueConvertersManager.add("alphaNumeric", alphaNumericConverter);

        crsbinding.data.setPropertyConverter(this, "model.numberValue", "string");
        crsbinding.data.setPropertyConverter(this, "model.date", "date", ["model.day:day", "model.week:week"]);
        crsbinding.data.setPropertyConverter(this, "model.number", "alphaNumeric");
    }

    load() {
        this.setProperty("model.number", "a");
        this.setProperty("model.numberValue", 255);
        const value = this.getProperty("model.numberValue");
        this.setProperty("model.date", new Date());

        super.load();
    }

    async disconnectedCallback() {
        crsbinding.valueConvertersManager.remove("string");
        await super.disconnectedCallback();
    }
}