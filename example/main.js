/**
 * @Author: tywd
 * @Date: 2022-07-04 21:17:12
 * @LastEditors: tywd
 * @LastEditTime: 2022-07-09 20:49:36
 * @FilePath: /guide-mini-vue3/example/main.js
 * @Description: 
 */
import { createApp } from "../../lib/guide-mini-vue.esm.js"
import { App } from "./App.js"

const rootContainer = document.getElementById('app')
createApp(App).mount(rootContainer)