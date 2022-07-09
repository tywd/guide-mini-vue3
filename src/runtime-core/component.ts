/**
 * @Author: tywd
 * @Date: 2022-07-04 22:02:41
 * @LastEditors: tywd
 * @LastEditTime: 2022-07-10 00:28:15
 * @FilePath: /guide-mini-vue3/src/runtime-core/component.ts
 * @Description: componnet 处理
 */
import { PublicInstanceProxyHandlers } from "./componentPublicInstance"
/**
 * @description 创建组件实例
 * @param vnode 虚拟节点 由于 传进来的 rootComponent 转换而来，首次是 App.js
 * @returns 返回一个组件实例对象
 */
export function createComponentInstance(vnode: any) {
    const component = {
        vnode,
        type: vnode.type,
        setupState: {} // 创建组件实例时初始化一个 setupeState，该值是 执行 setup 后的结果
    }

    return component
}

/**
 * @description 挂组件，初始化 props slots 等等
 * @param instance 上面 createComponentInstance 创建而来
 */
export function setupComponent(instance) {
    // TODO
    // initProps()
    // initSlots()
    setupStateFulComponent(instance)
}

// 处理子节点是组件类型的
function setupStateFulComponent(instance: any) {
    const Component = instance.type // 由于在 createComponentInstance 赋值了type， 所以 instance.type 等价于 instance.vnode.type
    // 引入代理
    instance.proxy = new Proxy({_: instance}, PublicInstanceProxyHandlers)
    const { setup } = Component  // 传进来的 App或者子组件 的 setup
    if (setup) {
        const setupResult = setup()
        handleSetupResult(instance, setupResult)
    }
}

// 绑定 setup 的值供组件实例使用
function handleSetupResult(instance, setupResult) {
    // setup 可以返回一个 Function or Object
    // TODO function

    if (typeof setupResult === 'object') {
        instance.setupState = setupResult
    }
    finishComponentSetup(instance)
}

// 绑定 render 供组件实例使用
function finishComponentSetup(instance: any) {
    const Component = instance.type

    instance.render = Component.render
}