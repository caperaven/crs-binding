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
        input: "src/events/event-mixin.js",
        output: [
            {file: 'dist/event-mixin.js', format: 'es'}
        ],
        plugins: [
            terser()
        ]
    },
    {
        input: "src/binding/bindable-element.js",
        output: [
            {file: 'dist/bindable-element.js', format: 'es', sourcemap: true}
        ],
        plugins: [
            terser()
        ]
    },
];