export const schema = {
    id: "process_schema",

    simple: {
        steps: {
            start: {
                type: "console",
                action: "log",
                args: {
                    messages: ["execute simple process"]
                }
            }
        }
    },

    binding: {
        parameters_def: {
            bId: { type: "number", required: true },
            value: { type: "number", required: true }
        },

        steps: {
            start: {
                type: "console",
                action: "log",
                args: {
                    messages: ["execute binding process", "$parameters.value"]
                }
            }
        }
    }
}