/**
 * @Author: tywd
 * @Date: 2022-06-14 20:09:26
 * @LastEditors: tywd
 * @LastEditTime: 2022-06-26 16:51:43
 * @FilePath: /guide-mini-vue3/src/reactivity/baseHandles.ts
 * @Description: 基础控制器
 */
import { track, trigger } from "./effect";
import { reactive, ReactiveFlags, readonly } from "./reactive";
import { extend, isObject } from "./shared";

// 提前初始化变量，方便复用
const get = createGetter();
const set = createSetter();
const readonlyGet = createGetter(true);
const shallowReadonlyGet = createGetter(true, true);
const shallowReactiveGet = createGetter(false, true);

/**
 * @decription Proxy 代理 get触发
 * @param {boolean} [isReadonly=false] 
 * isReadonly = true 时表示只允许读，即不允许set
 * @return {*} 
 */
function createGetter(isReadonly = false, isShallow = false) {
    return function (target, key) {
        const res = Reflect.get(target, key)
        if(key === ReactiveFlags.IS_REACTIVE) { // 如果key为IS_REACTIVE 即为true
            return !isReadonly
        } else if(key === ReactiveFlags.IS_READONLY){
            return isReadonly
        }

        // 嵌套 reactive 与 readonly 处理，将取到的 res 再嵌套一层返回即可
        if(!isShallow && isObject(res)) return isReadonly ? readonly(res) : reactive(res)

        if(!isReadonly) {
            // 收集依赖
            track(target, key);
        }

        // shallowRective or shallowReadonly 时 只有第一层具有 reactive or readonly 功能
        if(isShallow) return res

        return res
    }
}

/**
 * @decription Proxy 代理 set触发
 * @return {*} 
 */
function createSetter() {
    return function (target, key, value) {
        const res = Reflect.set(target, key, value)
        // 触发依赖
        trigger(target, key)
        return res
    }
}

export const mutableHandles = { get, set }
export const shallowReactivHandles = extend({}, mutableHandles, { get: shallowReactiveGet })

export const readonlyHandles = {
    get: readonlyGet,
    set(target, key, value) {
        // Set operation on key "currentNum" failed: target is readonly
        console.warn(`Set operation on key failed: target is readonly`, target)
        return true
    }
}
// ! 重构 shallowReadonlyHandles
export const shallowReadonlyHandles =  extend({}, readonlyHandles, { get: shallowReadonlyGet })
/* export const shallowReadonlyHandles = {
    get: shallowReadonlyGet,
    set(target, key, value) {
        // Set operation on key "currentNum" failed: target is shallowReadonly
        console.warn(`Set operation on key failed: target is shallowReadonly`, target)
        return true
    }
} */