export const setElementProperty = `requestAnimationFrame(() => element.__property__ = value || "")`;
export const setAttribute = `element.setAttribute("__property__", value || "")`;
export const setClassList = `
if (element.__classList!=null) {
    const remove = Array.isArray(element.__classList) ? element.__classList : [element.__classList];
    remove.forEach(cls => element.classList.remove(cls));
}
element.__classList = value;
const add = Array.isArray(value) ? value : [value];
add.forEach(cls => element.classList.add(cls));`;

export const setElementConditional = "requestAnimationFrame(() => element.__property__ = (__exp__) ? __true__ : __false__)";
