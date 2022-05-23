/*
 * @Author: tywd
 * @Date: 2022-05-23 21:53:35
 * @LastEditors: tywd
 * @LastEditTime: 2022-05-23 21:53:37
 * @FilePath: /guide-mini-vue3/babel.config.js
 * @Description: Do not edit
 */
module.exports = {
    presets: [
        ["@babel/preset-env", {
            targets: {
                node: "current"
            }
        }], "@babel/preset-typescript"
    ]
}