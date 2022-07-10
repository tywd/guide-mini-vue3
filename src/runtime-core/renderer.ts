/**
 * @Author: tywd
 * @Date: 2022-07-04 21:41:59
 * @LastEditors: tywd
 * @LastEditTime: 2022-07-10 16:32:33
 * @FilePath: /guide-mini-vue3/src/runtime-core/renderer.ts
 * @Description: 
 */
import { isObject } from '../shared';
import { ShapeFlags } from '../shared/ShapeFlags';
import { createComponentInstance, setupComponent } from "./component"
export function render(vnode, container) {
    patch(vnode, container)
}

function patch(vnode, container) {
    // check type of vnode  element 就处理element，如何区分element 和 component
    // console.log(vnode.type) // 可以看到首次挂在 是个object 类型，挂的是 App.js 的组件，如果是string类型则直接是element
    /* if (typeof vnode.type === 'string') { // element
        processElement(vnode, container)
    } else if (isObject(vnode.type)) { // component
        processComponent(vnode, container)
    } */

    const { shapeFlag } = vnode
    console.log('shapeFlag: ', shapeFlag) // 具体打印说明查看 README.md 《实现 shapeFlags》 章节
    if (shapeFlag & ShapeFlags.ELEMENT) {
        processElement(vnode, container)
    } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
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

    const { type, children, props, shapeFlag } = vnode
    // type  
    const el = (vnode.el = document.createElement(type))
    // children  string, array
    /* if (typeof children === 'string') {
        el.textContent = children
    } else if (Array.isArray(children)) {
        mountChildren(vnode.children, el)
    } */
    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
        el.textContent = children
    } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        mountChildren(children, el)
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
function mountComponent(initialVnode, container) {
    // 挂在组件时，创建一个组件实例，方便之后直接从实例中获取各项值
    const instance = createComponentInstance(initialVnode)
    // 绑定 setup 和 render 给到组件实例 instance，并执行组件的 setup 获得 return 的值
    setupComponent(instance)
    // 执行组件的 render 
    setupRenderEffect(instance, initialVnode, container)
}

/**
 * @description 执行 render 递归调用 patch 重复 拆组件的子组件
 * @param instance 组件实例
 * @param container 挂在节点的父容器
 */
function setupRenderEffect(instance, initialVnode, container) {
    const { proxy } = instance
    const subTree = instance.render.call(proxy)

    // vnode -> patch
    // vnode -> element -> mountElement
    patch(subTree, container)

    // 获取初始化完成(element -> mount挂载之后)之后的el，
    // 挂载完成后的 subTree 结构大致如下
    /* {
        children:[],
        props: {},
        type: '',
        el: '#root'
    } */
    // 把当前subTree根(root)节点的el赋值给(initialVnode)的el
    initialVnode.el = subTree.el
}