export function find(element, selectorFn) {
    for (const child of element.children) {
        if (selectorFn(child) == true) {
            return child;
        }

        // find in subtree
        const result = find(child, selectorFn);
        if (result != null) {
            return result;
        }
    }

    return null;
}

export function findAll(element, selectorFn, collection) {
    for (const child of element.children) {
        if (selectorFn(child) == true) {
            collection.push(child)
        }

        findAll(child, selectorFn, collection);
    }
}

export function createQueryFunction(query) {
    if (query.indexOf("[") != -1) {
        return createAttributeFunction(query);
    }

    if (query.indexOf("#") != -1) {
        return createIdFunction(query);
    }

    if (query.indexOf(".") != -1) {
        return createClassFunction(query);
    }

    return createTagFunction(query);
}

function createAttributeFunction(query) {
    const parts = query
        .split("[").join("")
        .split("]").join("")
        .split("'").join('"')
        .split('"').join("")
        .split("=");

    const code = `return item.getAttribute("${parts[0]}") == "${parts[1]}";`;
    return new Function("item", code);
}

function createIdFunction(query) {
    const parts = query.replace("#", "");
    const code = `return item.id == "${parts}";`;
    return new Function("item", code);
}

function createClassFunction(query) {
    const parts = query.replace(".", "");
    const code = `return item.classList.contains("${parts}");`;
    return new Function("item", code);
}

function createTagFunction(query) {
    const code = `return item.nodeName.toLowerCase() == "${query.toLowerCase()}";`;
    return new Function("item", code);
}