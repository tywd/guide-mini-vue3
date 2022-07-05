/**
 * @Author: tywd
 * @Date: 2022-07-05 22:45:13
 * @LastEditors: tywd
 * @LastEditTime: 2022-07-05 23:20:32
 * @FilePath: /guide-mini-vue3/rollup.config.js
 * @Description: rollup 打包库 天然支持 esm
 */
import typescript from "@rollup/plugin-typescript"
import pkg from './package.json'
export default {
    input: "./src/index.ts",
    output: [
        // 1.cjs -> common.js
        // 2.esm -> module
        {
            format: "cjs",
            file: pkg.main
        },
        {
            format: "es",
            file: pkg.module
        },
    ],
    plugins: [
        typescript()
    ]
}