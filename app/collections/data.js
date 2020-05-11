export function createItems(count) {
    const result = [];

    for (let i = 0; i < count; i++) {
        result.push(createItem(i));
    }

    return result;
}

let nextTaskCount = 1;
function createTasks(index) {
    const result = [];

    for (let i = 0; i < nextTaskCount; i++) {
        result.push({
            id: i,
            title: `task ${i} for ${index}`,
            isDone: false
        })
    }

    nextTaskCount += 1;
    if (nextTaskCount > 3) {
        nextTaskCount = 1;
    }

    return result;
}

let nextPriority = 0;

export function createItem(id) {
    const result = {
        id: id,
        title: `Code ${id}`,
        priority: nextPriority,
        tasks: createTasks(id),
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