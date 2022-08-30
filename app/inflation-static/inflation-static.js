export default class InflationStatic extends crsbinding.classes.ViewBase {
    get ul() {
        return this._element.querySelector("ul");
    }

    async connectedCallback() {
        await super.connectedCallback();
    }

    load() {
        // 1. setup inflation manager
        const template = this._element.querySelector("template");
        crsbinding.inflationManager.register("list-items", template);

        // 2. render initial list
        this.getData().then(data => {
            const fragment = crsbinding.inflationManager.get("list-items", data);
            this.ul.appendChild(fragment);
        });

        // 3. allow super functions to proceed
        super.load();
    }

    async getData() {
        const data = []

        for (let i = 0; i < 5; i++) {
            const number = await crs.call("random", "integer", {min: 0, max: 100});
            data.push({
                value: number,
                caption: `item ${number}`
            });
        }

        return data;
    }

    async update() {
        const data = await this.getData();
        const elements = this.ul.children;
        crsbinding.inflationManager.get("list-items", data, elements);
    }
}