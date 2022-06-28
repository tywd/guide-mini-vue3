/**
 * @Author: tywd
 * @Date: 2022-06-27 21:42:52
 * @LastEditors: tywd
 * @LastEditTime: 2022-06-28 09:00:05
 * @FilePath: \guide-mini-vue3\src\reactivity\ref.ts
 * @Description: ref isRef unRef proxyRefs
 */
import { hasChanged, isObject } from './shared/index';
import { isTracking, trackEffects, triggerEffects } from "./effect";
import { reactive } from './reactive';
class RefImpl {
    private _value: any;
    private dep: Set<unknown>;
    private _rawValue: any;
    public __v_isRef: boolean = true;
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

// 是否 ref 声明
export function isRef(ref) {
    // return raw instanceof RefImpl
    return !!ref.__v_isRef // !! 双感叹号 防止传入常量 or undefined 等 可以进行强转换 boolean 类型
}

// 非ref声明的直接返回本身
export function unRef(ref) {
    return isRef(ref) ? ref.value : ref;
}

export function proxyRefs(value) {
}