/**
 * @Author: tywd
 * @Date: 2022-06-27 21:42:52
 * @LastEditors: tywd
 * @LastEditTime: 2022-06-27 23:10:40
 * @FilePath: /guide-mini-vue3/src/reactivity/ref.ts
 * @Description: ref isRef unRef proxyRefs
 */
import { hasChanged, isObject } from './shared/index';
import { isTracking, trackEffects, triggerEffects } from "./effect";
import { reactive } from './reactive';
class RefImpl {
    private _value: any;
    private dep: Set<unknown>;
    private _rawValue: any;
    constructor(value) {
        this._rawValue = value
        this._value = convert(value)
        this.dep = new Set() // 使用 Set 收集与触发依赖
    }

    get value() {
        trackRefValue(this) // 收集依赖
        return this._value
    }

    set value(newValue) {
        // set 时若值未改变，不应修改，继续取 get value
        // 此处应用 _rawValue 与 newValue 原值比较，不可使用 _value (因为该值可能是嵌套的 reactive 比较麻烦)
        if (hasChanged(this._rawValue, newValue)) {
            this._rawValue = newValue
            this._value = convert(newValue)
            triggerEffects(this.dep) // 触发依赖
        }
    }
}

/**
 * @description: isObject 则继续用 reactive 嵌套响应式
 * @param {*} value
 */
const convert = (value) => isObject(value) ? reactive(value) : value;

// 收集依赖
function trackRefValue(ref) {
    if (isTracking()) {
        trackEffects(ref.dep)
    }
}

export function ref(value) {
    value = new RefImpl(value)
    return value
}

export function isRef(value) {
}

export function unRef(value) {
}

export function proxyRefs(value) {
}