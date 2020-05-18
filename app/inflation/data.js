export function getRenderData() {
    /**
     * matrix       Foreman    Admin   Line Manager
     * JohnDoe          x       -       -
     * Peter Smith      x       x       -
     * Adam Ranger      -       -       x
     */

    const result = [{id: -1, title: "matrix", type:"header"}];
    trades.forEach(item => result.push({id: item.id, title: item.title, type: "header"}));

    people.forEach(item => {
        result.push({id: item.id, title: item.title, type:"person"});
        result.push({person: item.id, trade: 0, value: item.trades["0"], type:"cell"});
        result.push({person: item.id, trade: 1, value: item.trades["1"], type:"cell"});
        result.push({person: item.id, trade: 2, value: item.trades["2"], type:"cell"});
    });

    return result;
}

const people = [
    {
        id: 0,
        title: "John Doe",
        trades: {
            0: true,
            1: false,
            2: false,
        }
    },
    {
        id: 1,
        title: "Peter Smith",
        trades: {
            0: true,
            1: true,
            2: false,
        }
    },
    {
        id: 2,
        title: "Adam Ranger",
        trades: {
            0: false,
            1: false,
            2: true,
        }
    }
];

const trades = [
    {
        id: 0,
        title: "Foreman"
    },
    {
        id: 1,
        title: "Admin"
    },
    {
        id: 2,
        title: "Line Manager"
    }
];