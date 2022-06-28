/**
 * @Author: tywd
 * @Date: 2022-06-28 21:30:01
 * @LastEditors: tywd
 * @LastEditTime: 2022-06-28 22:20:59
 * @FilePath: /guide-mini-vue3/src/reactivity/computed.ts
 * @Description: computed
 */
import { ReactiveEffect } from './effect';
class ComputedRefImpl {
    private _getter: any
    private _dirty: boolean = true
    private _effect: any;
    private _value: any
    constructor(getter) {
        this._getter = getter
        this._dirty = true
        this._effect = new ReactiveEffect(getter, () => {
            // ReactiveEffect 当有第二个参数 schedule 时，schedule 一开始不会被执行
            // 当执行完 getter 一次后，之后 set 时都会执行第二个方法 schedule
            // 若未设置 第二个参数 schedule 则一直执行第一个参数 getter 方法
            if (!this._dirty) {
                this._dirty = true
            }
        })
    }

    get value() {
        if (this._dirty) {
            this._dirty = false
            this._value = this._effect.run()
        }
        return this._value
    }
}

/**
 * @description 接受一个 `getter` 函数，返回一个只读的响应式 `ref` 对象，即 `getter` 函数的返回值。
 * 它也可以接受一个带有 `get` 和 `set` 函数的对象来创建一个可写的 `ref` 对象
 * @param {function} getter
 * @return {ComputedRefImpl} 
 */
export function computed(getter) {
    return new ComputedRefImpl(getter)
}