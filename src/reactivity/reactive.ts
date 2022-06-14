/*
 * @Author: tywd
 * @Date: 2022-05-23 22:03:28
 * @LastEditors: tywd
 * @LastEditTime: 2022-06-14 20:12:05
 * @FilePath: /guide-mini-vue3/src/reactivity/reactive.ts
 * @Description: reactive 实现
 */
import { mutableHandles, readonlyHandles } from "./baseHandles";

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

/**
 * @Descripttion 不可以被修改，也就是不可以被 set
 * @param {object} raw 
 * @return {*} 
 */
export function readonly(raw) {
    return createActiveObject(raw, readonlyHandles)
}

function createActiveObject(raw, baseHandles = mutableHandles){
    return new Proxy(raw, baseHandles) // 使用 Proxy 来进行代理
}