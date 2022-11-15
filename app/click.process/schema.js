export const schema = {
    "id": "test_schema",

    "main": {
        "parameters_def": {
            "x" : { type: "number", required: true },
            "y" : { type: "number", required: true },
        },

        "steps": {
            "start": {
                "type": "console",
                "action": "log",
                "args": {
                    "messages": ["$parameters.x", "$parameters.y"]
                }
            }
        }
    }
}