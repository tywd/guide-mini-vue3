/**
 * @Author: tywd
 * @Date: 2022-07-04 21:25:35
 * @LastEditors: tywd
 * @LastEditTime: 2022-07-04 21:56:02
 * @FilePath: /guide-mini-vue3/src/runtime-core/createApp.ts
 * @Description: 
 */
import { render } from "./renderer"
import { createVnode } from "./vnode"

export function createApp(rootComponent) {
    return {
        mount(rootContainer) {
            // vnode
            // component -> vnode
            // 所有的逻辑操作都会基于 vnode 操作
            const vnode = createVnode(rootComponent)
            render(vnode, rootContainer)
        }
    }
}
