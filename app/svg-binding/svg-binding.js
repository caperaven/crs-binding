export default class SvgBinding extends crsbinding.classes.ViewBase {
    preLoad() {
        this.createItems();
        this.setProperty("circle", {x: 30, y: 100, r: 20});
    }

    load() {
        crsbinding.data.updateUI(this, "items");
        super.load();
    }

    createItems() {
        const items = [];
        let x = 20;

        for (let i = 0; i < 1000; i++) {
            items.push({
                x: x,
                y: 10,
                r: 5
            })

            x += 20;
        }

        this.setProperty("items", items);
    }

    update() {
        const array = this.getProperty("items");
        for (let item of array) {
            item.y = this.getRndInteger(10, 100);
            item.r = this.getRndInteger(5, 10);
            crsbinding.data.updateUI(item);
        }
    }

    startAnimate() {
        const array = this.getProperty("items");

        this.interval = setInterval(() => {
            for (let item of array) {
                item.y = this.getRndInteger(10, 200);
                item.r = this.getRndInteger(5, 10);

                if (item.x < 800) {
                    crsbinding.data.updateUI(item);
                }
            }

            this.setProperty("circle.x", this.getRndInteger(30, 770));
            this.setProperty("circle.r", this.getRndInteger(10, 100));

        }, 1000)
    }

    stopAnimate() {
        clearInterval(this.interval);
    }

    getRndInteger(min, max) {
        return Math.floor(Math.random() * (max - min) ) + min;
    }
}