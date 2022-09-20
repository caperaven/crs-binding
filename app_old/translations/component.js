class Component extends HTMLElement {
    async connectedCallback() {
        this.innerHTML = await fetch(import.meta.url.replace(".js", ".html")).then(result => result.text());
        await crsbinding.translations.parseElement(this);
    }
}

customElements.define("component-element", Component);