import {dates} from "./dates.js";

export default class InflationManager extends crsbinding.classes.ViewBase {
    async connectedCallback() {
        await super.connectedCallback();
        await this.#render(dates[0]);
        await this.#render(dates[1]);
        await this.#render(dates[2]);
    }

    async preLoad(){
        const template = this._element.querySelector("#tplWeek");
        await crsbinding.inflationManager.register("week", template);
    }

    async #render(week) {
        const element = this.table.querySelector(`[data-id="${week.week}"]`);
        const fragment = crsbinding.inflationManager.get("week", [week], element == null ? null : [element]);

        if (fragment != null) {
            this.table.appendChild(fragment);
        }
    }

    async update() {
        const week = dates[0];
        week.day1.value = 100;
        week.day2.value = 101;
        week.day3.value = 102;
        week.day4.value = 103;
        week.day5.value = 104;
        week.day6.value = 105;
        week.day7.value = 106;

        await this.#render(week);
    }
}