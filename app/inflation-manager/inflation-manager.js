import {dates} from "./dates.js";

export default class InflationManager extends crsbinding.classes.ViewBase {
    async connectedCallback() {
        await super.connectedCallback();
        await this.#render(dates.week1);
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
        const week = dates.week1;
        week.day1.value = 8;
        week.day2.value = 9;
        week.day3.value = 10;
        week.day4.value = 11;
        week.day5.value = 12;
        week.day6.value = 13;
        week.day7.value = 14;

        await this.#render(week);
    }
}