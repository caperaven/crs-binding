class t extends HTMLElement{connectedCallback(){fetch(import.meta.url.replace(".js",".html")).then(e=>e.text()).then(e=>this.innerHTML=e)}}customElements.define("crs-loader",t);export{t as Loader};
