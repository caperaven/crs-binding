export default class Overflow extends crsbinding.classes.ViewBase {
    preLoad() {
        this.createRectangles();
    }

    load() {
        super.load();
    }

    createRectangles() {
        const rectangles = [];
        const height = 24;
        const padding = 2;
        for (let i = 0; i < 1; i++) {
            rectangles.push({
                x: 0,
                y: (i * height) + padding,
                width: 100,
                height: height
            })
        }
        this.setProperty("rectangles", rectangles);
    }
}