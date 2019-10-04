import { terser } from "rollup-plugin-terser";

export default [
    {
        input: "src/index.js",
        output: [
            {file: 'dist/crs-binding.js', format: 'es'}
        ],
        plugins: [
            terser()
        ]
    },
    {
        input: "src/event-mixin.js",
        output: [
            {file: 'dist/event-mixin.js', format: 'es'}
        ],
        plugins: [
            terser()
        ]
    },
];