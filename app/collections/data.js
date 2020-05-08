export function createItems(count) {
    const result = [];

    for (let i = 0; i < count; i++) {
        result.push(createItem(i));
    }

    return result;
}

function createTasks(index, count) {
    const result = [];

    for (let i = 0; i < count; i++) {
        result.push({
            id: i,
            title: `task ${i} for ${index}`,
            isDone: false
        })
    }

    return result;
}

export function createItem(id) {
    return {
        id: id,
        title: `Code ${id}`,
        priority: 0,
        tasks: createTasks(id, 3),
        isDone: false
    }
}

export function createPriorities() {
    return [
        {
            id: 0,
            title: "Low"
        },
        {
            id: 1,
            title: "Medium"
        },
        {
            id: 2,
            title: "High"
        }
    ]
}