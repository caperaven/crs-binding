class SvgHover extends crsbinding.classes.SvgElement {
    connectedCallback() {
        this.element.addEventListener("click", (event) => {
            event.target.setAttribute("fill", "#ff0090")
        });

        requestAnimationFrame(() => {
            this.element.dataset.isReady = true;
        })
    }

    disconnectedCallback() {
        console.log("disconnected");
    }
}

crsbinding.svgCustomElements.define("svg-hover", SvgHover);

