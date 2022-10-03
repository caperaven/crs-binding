globalThis.__elementRegistry = {};
globalThis.customElements = {
    define: (id, className, options) => globalThis.__elementRegistry[id] = className
}