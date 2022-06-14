/*
 * @Author: tywd
 * @Date: 2022-06-14 20:09:26
 * @LastEditors: tywd
 * @LastEditTime: 2022-06-14 22:12:30
 * @FilePath: /guide-mini-vue3/src/reactivity/baseHandles.ts
 * @Description: 基础控制器
 */
import { track, trigger } from "./effect";

// 提前初始化变量，方便复用
const get = createGetter();
const set = createSetter();
const readonlyGet = createGetter(true);

/**
 * @decription Proxy 代理 get触发
 * @param {boolean} [isReadonly=false] 
 * isReadonly = true 时表示只允许读，即不允许set
 * @return {*} 
 */
function createGetter(isReadonly = false) {
    return function (target, key) {
        const res = Reflect.get(target, key)
        if (!isReadonly) {
            // 收集依赖
            track(target, key);
        }
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
export const readonlyHandles = {
    get: readonlyGet,
    set(target, key, value) {
        // Set operation on key "currentNum" failed: target is readonly
        console.warn(`Set operation on key failed: target is readonly`, target)
        return true
    }
}