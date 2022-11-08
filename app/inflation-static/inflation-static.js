export default class InflationStatic extends crsbinding.classes.ViewBase {
    async load() {
        // 1. setup inflation manager
        const template = this._element.querySelector("template");
        await crsbinding.inflationManager.register("list-items", template);

        // 2. render initial list
        this.getData().then(data => {
            const fragment = crsbinding.inflationManager.get("list-items", data);
            this.container.appendChild(fragment);
        });

        // 3. allow super functions to proceed
        super.load();
    }

    async getData() {
        const data = [];

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
        // 1. get the data to use
        const data = await this.getData();

        // 2. get the elements to update
        const elements = this.container.children;

        // 3. update the elements with the new data
        crsbinding.inflationManager.get("list-items", data, elements);
    }
}