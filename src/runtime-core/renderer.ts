/**
 * @Author: tywd
 * @Date: 2022-07-04 21:41:59
 * @LastEditors: tywd
 * @LastEditTime: 2022-07-04 22:48:41
 * @FilePath: /guide-mini-vue3/src/runtime-core/renderer.ts
 * @Description: 
 */
import { createComponentInstance, setupComponent } from "./component"
export function render(vnode, container) {
    patch(vnode, container)
}

function patch(vnode, container) {
    // check type of vnode
    // TODO element

    processComponent(vnode, container)
}

// 处理组件类型
function processComponent(vnode, container) {
    mountComponent(vnode, container)
}

/**
 * @description 挂载组件 包括执行 setup
 * @param vnode 被挂载的虚拟节点
 * @param container 挂载节点的父容器
 */
function mountComponent(vnode, container) {
    // 挂在组件时，创建一个组件实例，方便之后直接从实例中获取各项值
    const instance = createComponentInstance(vnode)
    // 绑定 setup 和 render 给到组件实例 instance，并执行组件的 setup 获得 return 的值
    setupComponent(instance)
    // 执行组件的 render 
    setupRenderEffect(instance, container)
}

/**
 * @description 执行 render 递归调用 patch 重复 拆组件的子组件
 * @param instance 组件实例
 * @param container 挂在节点的父容器
 */
function setupRenderEffect(instance, container){
    const subTree = instance.render()

    // vnode -> patch
    // vnode -> element -> mountElement

    patch(subTree, container)
}