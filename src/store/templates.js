/**
 * Add a existing HTMLTemplateElement for a given component name to the templates registry
 * @param componentName {string} - component name that this template is for
 * @param template {HTMLTemplateElement} - template to set on registry
 */
export function addTemplate(componentName, template) {
    crsbinding.templates.data[componentName] = template;
}

/**
 * Remove a component or components from the registry
 * @param componentNames {string | array<string>} component or components to remove from the registry
 */
export function unloadTemplates(componentNames) {
    const collection = Array.isArray(componentNames) == true ? componentNames : [componentNames];
    for (let name of collection) {
        delete crsbinding.templates.data[name];
    }
}

/**
 * Clear the template registry from all loaded templates
 */
export function unloadAllTemplates() {
    const keys = Object.keys(crsbinding.templates.data);
    for (let key of keys) {
        delete crsbinding.templates.data[key];
    }
}

/**
 * This function returns a template from and if it does does not exist yet, loads it from the URL.
 * @param componentName {string} - component name that this template is for
 * @param url {string} - url to load the HTML from
 * @returns {Promise<string>} - HTML of the template
 */
export async function getTemplate(componentName, url) {
    let template = crsbinding.templates.data[componentName];

    if (template == null) {
        template = await loadTemplate(componentName, url);
    }

    return template.cloneNode(true).innerHTML;
}

/**
 * load or preload the template from a given url and add it to the registry
 * @param componentName {string} - component name that this template is for
 * @param url {string} - url to load the HTML from
 * @returns {Promise<HTMLTemplateElement>} - the template created from the HTML loaded
 */
export async function loadTemplate(componentName, url) {
    let template = crsbinding.templates.data[componentName];
    if (template != null) return template;

    template = document.createElement("template");
    template.innerHTML = await fetch(url).then(result => result.text());
    crsbinding.templates.data[componentName] = template;

    return template;
}

export async function loadFromElement(store, element, url) {
    if (crsbinding.templates.data[store] != null) {
        return crsbinding.templates.data[store].count += 1;
    }

    const storeItem = {
        count: 1,
        templates: {}
    }

    let templates;
    if (url != null) {
        const fragment = document.createElement("template");
        fragment.innerHTML = await fetch(url).then(result => result.text());
        templates = fragment.content.querySelectorAll("template");
    }
    else {
        templates = element.querySelectorAll("template");
    }

    let defaultTemplate;
    for (let template of templates) {
        storeItem.templates[template.id] = template;
        template.parentElement?.removeChild(template);
        if (template.dataset.default === "true") {
            defaultTemplate = template;
        }
    }

    crsbinding.templates.data[store] = storeItem;
    const result = defaultTemplate?.content.cloneNode(true);
    result.name = defaultTemplate.id;
    return result;
}

export async function getTemplateById(store, id) {
    const storeItem = crsbinding.templates.data[store];
    const template = storeItem.templates[id];
    return template.content.cloneNode(true);
}