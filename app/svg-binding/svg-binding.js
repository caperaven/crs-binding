import {describeArc} from "./shaptools.js";

export default class SvgBinding extends crsbinding.classes.ViewBase {
    constructor() {
        super();
        this.angle = 0;
        this.rotation = 0;
        this.pathData = [100, 50, 150, 120, 130];
    }

    preLoad() {
        this.createItems();
        this.setProperty("circle", {x: 30, y: 100, r: 20});
        this.setProperty("arc2", describeArc(200, 200, 100, 180, 270))
        this.setProperty("arc", describeArc(200, 200, 100, 0, 90))
        this.setProperty("rotation", `rotate(${this.rotation}deg)`);
        this.dataToPath()
    }

    load() {
        crsbinding.data.updateUI(this, "items");
        super.load();
    }

    async disconnectedCallback() {
        this.stopAnimate();
        await super.disconnectedCallback();
    }

    dataToPath() {
        const parts = [`M0,${this.pathData[0]}`];
        let x = 100;

        for (let i = 1; i < this.pathData.length; i++) {
            parts.push(`L${x},${this.pathData[i]}`);
            x += 100;
        }

        const path = parts.join(" ");
        this.setProperty("path", path);
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

        const fn = () => {
            this.setProperty("circle.x", this.getRndInteger(30, 770));
            this.setProperty("circle.r", this.getRndInteger(10, 100));
            this.setProperty("arc", describeArc(200, 200, 100, this.angle, this.angle + 90))
            this.setProperty("rotation", `rotate(${this.rotation}deg)`);
            this.setProperty("angle", this.angle);
            this.dataToPath();
        }

        this.interval = setInterval(() => {
            for (let item of array) {
                item.y = this.getRndInteger(10, 200);
                item.r = this.getRndInteger(5, 10);

                if (item.x < 800) {
                    crsbinding.data.updateUI(item);
                }
            }

            for (let i = 0; i < this.pathData.length; i++) {
                this.pathData[i] = this.getRndInteger(10, 190)
            }

            this.angle += 45;
            if (this.angle == 360) {
                this.angle = 0;
            }

            this.rotation += 90;

            crsbinding.idleTaskManager.add(fn);

        }, 1000)
    }

    stopAnimate() {
        clearInterval(this.interval);
    }

    getRndInteger(min, max) {
        return Math.floor(Math.random() * (max - min) ) + min;
    }
}