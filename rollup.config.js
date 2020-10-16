export default [
    {
        input: "src/index.js",
        output: [
            {file: 'dist/crs-binding.js', format: 'es', sourcemap: false}
        ]
    },
    {
        input: "src/views-loader.js",
        output: [
            {file: 'dist/views-loader.js', format: 'es', sourcemap: false}
        ]
    }
    // {
    //     input: "src/binding/bindable-element.js",
    //     output: [
    //         {file: 'dist/crs-bindable-element.js', format: 'es', sourcemap: false}
    //     ],
    //     plugins: [
    //         terser()
    //     ]
    // },
    // {
    //     input: "src/view/view-base",
    //     output: [
    //         {file: 'dist/crs-view-base.js', format: 'es', sourcemap: false}
    //     ],
    //     plugins: [
    //         terser()
    //     ]
    // }
];