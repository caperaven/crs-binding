import { terser } from "rollup-plugin-terser";

export default {
    input: "src/index.js",
    output: [
        {file: 'dist/crs-binding.min.js', format: 'cjs'},
        {file: 'dist/crs-binding.esm.js', format: 'es'}
    ],
    plugins: [
        terser({
            include: [/^.+\.min\.js$/, '*esm*'],
            exclude: ['some*']
        })
    ]
};