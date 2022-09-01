export default class InflationStatic extends crsbinding.classes.ViewBase {
    async connectedCallback() {
        await super.connectedCallback();
        await this.getData();
    }

    preLoad() {
        this.setProperty("count", 5);
    }

    async getData() {
        const data = [];

        const count = this.getProperty("count");

        for (let i = 0; i < count; i++) {
            const number = await crs.call("random", "integer", {min: 0, max: 100});
            data.push({
                value: number,
                caption: `item ${number}`
            });
        }

        this.setProperty("data", data);
    }

    async update() {
        await this.getData();
    }
}