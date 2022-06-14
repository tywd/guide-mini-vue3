/*
 * @Author: tywd
 * @Date: 2022-05-23 22:03:24
 * @LastEditors: tywd
 * @LastEditTime: 2022-06-15 00:45:16
 * @FilePath: /guide-mini-vue3/src/reactivity/tests/reactive.spec.ts
 * @Description: reactive 测试
 */
import { isReactive, reactive } from "../reactive";

describe('reactive', () => {
    it('happy path', () => {
        const original = { foo: 1 }
        const observed = reactive(original);
        expect(observed).not.toBe(original);
        expect(original.foo).toBe(1);

        expect(isReactive(observed)).toBe(true);
        expect(isReactive(original)).toBe(false);
    });
})