export function unloadTemplates(componentNames) {
    const collection = Array.isArray(componentNames) == true ? componentNames : [componentNames];
    for (let name of collection) {
        delete crsbinding.templates.data[name];
    }
}

export function unloadAllTemplates() {
    const keys = Object.keys(crsbinding.templates.data);
    for (let key of keys) {
        delete crsbinding.templates.data[key];
    }
}

export function addTemplate(componentName, template) {
    crsbinding.templates.data[componentName] = template;
}

export async function getTemplate(componentName, url) {
    let template = crsbinding.templates.data[componentName];

    if (template == null) {
        template = document.createElement("template");
        template.innerHTML = await fetch(url).then(result => result.text());
        crsbinding.templates.data[componentName] = template;
    }

    return template.cloneNode(true).innerHTML;
}