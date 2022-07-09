/**
 * @Author: tywd
 * @Date: 2022-07-04 21:41:59
 * @LastEditors: tywd
 * @LastEditTime: 2022-07-09 22:07:22
 * @FilePath: /guide-mini-vue3/src/runtime-core/renderer.ts
 * @Description: 
 */
import { isObject } from './../reactivity/shared/index';
import { createComponentInstance, setupComponent } from "./component"
export function render(vnode, container) {
    patch(vnode, container)
}

function patch(vnode, container) {
    // check type of vnode  element 就处理element，如何区分element 和 component
    // console.log(vnode.type) // 可以看到首次挂在是个object 类型，挂的是 App.js 的组件，如果是string类型则直接是element
    if (typeof vnode.type === 'string') { // element
        processElement(vnode, container)
    } else if (isObject(vnode.type)) { // component
        processComponent(vnode, container)
    }
}

// 处理element类型
function processElement(vnode, container) {
    mountElement(vnode, container)
}

function mountElement(vnode, container) {
    /* const el = document.createElement("div")
    el.textContent = 'hi mini-vue'
    el.setAttribute('id', 'root')
    document.body.append(el) */

    // 对应 
    /* h('div', {
        id: 'root',
        class: ['red', 'blue']
    }, 
    'hi, ' + this.msg) */

    const { type, children, props } = vnode
    // type  
    const el = document.createElement(type)
    // children  string, array
    if (typeof children === 'string') {
        el.textContent = children
    } else if (Array.isArray(children)) {
        mountChildren(vnode.children, el)
    }
    // props
    for (const key in props) {
        if (Object.prototype.hasOwnProperty.call(props, key)) {
            const val = props[key]
            el.setAttribute(key, val)
        }
    }
    container.append(el)
}

// 嵌套 children 类型 继续进行 patch
function mountChildren(children, container) {
    children.forEach(v => {
        patch(v, container)
    });
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
function setupRenderEffect(instance, container) {
    const subTree = instance.render()

    // vnode -> patch
    // vnode -> element -> mountElement

    patch(subTree, container)
}