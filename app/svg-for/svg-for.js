export default class SvgFor extends crsbinding.classes.ViewBase {
    preLoad() {
        this.createRectangles();
    }

    load() {
        crsbinding.data.updateUI(this, "rectangles");
        super.load();
    }

    createRectangles() {
        const rectangles = [];
        const height = 24;
        const padding = 10;
        let y = 0;

        for (let i = 0; i < 10; i++) {
            rectangles.push({
                x: 0,
                y: y,
                width: 100,
                height: height
            })

            y = y + height + padding;
        }
        this.setProperty("rectangles", rectangles);
    }
}