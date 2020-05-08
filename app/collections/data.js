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

let nextPriority = 0;

export function createItem(id) {
    const result = {
        id: id,
        title: `Code ${id}`,
        priority: nextPriority,
        tasks: createTasks(id, 3),
        isDone: false
    };

    nextPriority += 1;
    if (nextPriority > 2) {
        nextPriority = 0;
    }

    return result;
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