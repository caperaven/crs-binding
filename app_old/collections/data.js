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
        result.push(createTask(i, index));
    }

    nextTaskCount += 1;
    if (nextTaskCount > 3) {
        nextTaskCount = 1;
    }

    return result;
}

export function createTask(id, index) {
    return {
        id: id,
        title: `task ${id} for ${index}`,
        isDone: false
    }
}

let nextPriority = 0;

export function createItem(id) {
    const result = {
        id: id,
        title: `Code ${id}`,
        priority: nextPriority,
        tasks: createTasks(id),

        get isDone() {
            return this._isDone == true;
        },

        set isDone(newValue) {
            this._isDone = newValue;
            for (let task of this.tasks) {
                task.isDone = newValue;
                task.__uid && crsbinding.data.updateUI(task);
            }
        }
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