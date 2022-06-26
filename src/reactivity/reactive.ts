/**
 * @Author: tywd
 * @Date: 2022-05-23 22:03:28
 * @LastEditors: tywd
 * @LastEditTime: 2022-06-26 23:03:16
 * @FilePath: /guide-mini-vue3/src/reactivity/reactive.ts
 * @Description: reactive readonly isReactive isReadonly shallowReactiv shallowReadonly isProxy 实现
 */
import { mutableHandles, readonlyHandles, shallowReactivHandles, shallowReadonlyHandles } from "./baseHandles";

// 定义一个枚举来让 reactive 和 readonly 访问
export const enum ReactiveFlags {
    IS_REACTIVE = '__v_isReactive',
    IS_READONLY = '__v_isReadonly'
}

/**
 * @Descripttion
 * @param raw {object} reactive 传进的 object
 * ? 关于使用vue3 Proxy 数据劫持为什么用 Reflect.get(target,key) 而不用 target[key] 的原因
   当我们在 Proxy 中使用Reflect，可以添加一个额外参数receiver，可以被传递到Reflect调用中。
    get(target, key, recivier) {
        Reflect.get(target, key, receiver)
   这能确保当我们的对象有从其他对象继承的值/函数时，this 值能正确地指向调用对象。使用 Proxy 的一个难点就是this绑定。我们希望任何方法都绑定到这个 Proxy，而不是target对象。这就是为什么我们总是在Proxy内部使用Reflect，这样我们就能保留我们正在自定义的原始行为
 * @return {*}
 */
export function reactive(raw) {
    return createActiveObject(raw, mutableHandles)
}

export function shallowReactive(raw){
    return createActiveObject(raw, shallowReactivHandles)
}

export function shallowReadonly(raw){
    return createActiveObject(raw, shallowReadonlyHandles)
}

/**
 * @Descripttion 不可以被修改，也就是不可以被 set
 * @param {object} raw 
 * @return {*} 
 */
export function readonly(raw) {
    return createActiveObject(raw, readonlyHandles)
}

/**
 * @description 判断是否是我们做的 reactive 方法类型
 * @param {reactive} value 当访问value的子元素时会触发 reactive 方法里的 get，获得key is_reactive，所以在 reactive - get 里处理即可
 * @return {boolean} 
 */
export function isReactive(value){
    // 若校验是否为false，传入的可能不是一个reactive而是一个普通的object，
    // 而object里没有改key值会返回 undefined，则统一用 !! 转 boolean
    return !!value[ReactiveFlags.IS_REACTIVE] 
}

/**
 * @description 判断是否是我们做的 readonly 方法类型，与 isReactive 同理
 * @param {reactive} value
 * @return {boolean} 
 */
export function isReadonly(value){
    return !!value[ReactiveFlags.IS_READONLY]
}

function createActiveObject(raw, baseHandles = mutableHandles){
    return new Proxy(raw, baseHandles) // 使用 Proxy 来进行代理
}

/**
 * @description 判断是否是 isProxy 方法类型
 * @param {reactive | readonly | shallowReactive | shallowReadonly} value
 * @return {boolean} 
 */
export function isProxy(value){
    return isReactive(value) || isReadonly(value)
}