export default [
    {
        input: "src/index.js",
        output: [
            {file: 'dist/crs-binding.js', format: 'es', sourcemap: false}
        ]
    },
    {
        input: "src/plugin-loaders/views-loader.js",
        output: [
            {file: 'dist/plugin-loaders/views-loader.js', format: 'es', sourcemap: false}
        ]
    },
    {
        input: "src/plugin-loaders/attr-loader.js",
        output: [
            {file: 'dist/plugin-loaders/attr-loader.js', format: 'es', sourcemap: false}
        ]
    },
    {
        input: "src/plugin-loaders/event-aggregator-loader.js",
        output: [
            {file: 'dist/plugin-loaders/event-aggregator-loader.js', format: 'es', sourcemap: false}
        ]
    },
    {
        input: "src/plugin-loaders/if-loader.js",
        output: [
            {file: 'dist/plugin-loaders/if-loader.js', format: 'es', sourcemap: false}
        ]
    },
    {
        input: "src/plugin-loaders/setvalue-loader.js",
        output: [
            {file: 'dist/plugin-loaders/setvalue-loader.js', format: 'es', sourcemap: false}
        ]
    }
];