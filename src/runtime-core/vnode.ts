/**
 * @Author: tywd
 * @Date: 2022-07-04 21:47:26
 * @LastEditors: tywd
 * @LastEditTime: 2022-07-04 21:55:48
 * @FilePath: /guide-mini-vue3/src/runtime-core/vnode.ts
 * @Description: 
 */
export function createVnode(type, props?, children?) {
    const vnode = {
        type,
        props,
        children
    }

    return vnode
}