export const setElementProperty = `requestAnimationFrame(() => element.__property__ = value);`;
export const setElementValueProperty = `requestAnimationFrame(() => element.__property__ = value == null ? "" : value);`;
export const setAttribute = `element.setAttribute("__property__", value == null ? "" : value)`;
export const setElementConditional = "requestAnimationFrame(() => element.__property__ = (__exp__) ? __true__ : __false__)";
export const setDataset = `element.dataset["__property__"] = value == null ? "" : value`;

const setClassListRemove = `
if (element.__classList!=null) {
    const remove = Array.isArray(element.__classList) ? element.__classList : [element.__classList];
    remove.forEach(cls => element.classList.remove(cls));
}`;

const setClassListValue = `
element.__classList = value;
const add = Array.isArray(value) ? value : [value];
add.forEach(cls => element.classList.add(cls));`;

export const setClassList = `${setClassListRemove} ${setClassListValue}`;

export const setClassListCondition = `
    ${setClassListRemove}

    if (__exp__) {
        ${setClassListValue.split("value").join("__true__")}
    }
    else {
        ${setClassListValue.split("value").join("__false__")}
    }
`;