export class ComputedStyleMock {
    constructor(element) {
        this.style = JSON.parse(JSON.stringify(element.style));
    }

    getPropertyValue(variable) {
        return this.style[variable];
    }
}

globalThis.getComputedStyle = (element) => {
    return new ComputedStyleMock(element);
}