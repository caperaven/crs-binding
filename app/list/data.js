export function getData(count) {
    const result = [];
    for (let i = 0;i < count; i++) {
        result.push({
            id: i,
            code: `Code ${i}`,
            description: `Description ${i}`
        })
    }
    return result;
}