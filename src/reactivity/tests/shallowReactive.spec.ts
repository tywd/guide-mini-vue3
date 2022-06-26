/**
 * @Author: tywd
 * @Date: 2022-06-25 14:19:42
 * @LastEditors: tywd
 * @LastEditTime: 2022-06-26 23:03:44
 * @FilePath: /guide-mini-vue3/src/reactivity/tests/shallowReactive.spec.ts
 * @Description: shallowReactive 只有第一层是 reactive，第二层以及之后的内层 不为 reactive
 */
import { effect } from "../effect";
import { shallowReactive, isReactive, reactive, isProxy } from "../reactive";

describe('shallowReactive', () => {
    it('should not make non-reactive properties reactive', () => {
        const original = { foo: 1, nested: { bar: 2 } }
        const observed = shallowReactive(original)
        const obj = reactive({ foo: 1, nested: { bar: 2 } })
        expect(isReactive(observed)).toBe(true)
        expect(isReactive(observed.foo)).toBe(false)
        
        let dummy, dummy2, dummy3;
        effect(() => {
            dummy = observed.nested.bar
            dummy2 = observed.foo
            dummy3 = obj.nested.bar
        });
        observed.nested.bar++
        expect(dummy).toBe(2)  // 第二层以及之后的内层 不为 reactive， 即 observed.nested.bar 非响应式，所以dummy仍为2

        observed.foo++
        expect(dummy2).toBe(2) // 只有第一层是 reactive，即 observed.foo 响应式，所以dummy2为2

        obj.nested.bar++;
        expect(dummy3).toBe(3) // obj 整个包括嵌套子层是 reactive，即 obj.nested.bar 响应式，所以dummy3为3

        expect(isProxy(observed)).toBe(true);
    });
})