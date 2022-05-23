/*
 * @Author: tywd
 * @Date: 2022-05-23 22:03:24
 * @LastEditors: tywd
 * @LastEditTime: 2022-05-23 22:05:29
 * @FilePath: /guide-mini-vue3/src/reactivity/tests/reactive.spec.ts
 * @Description: reactive 测试
 */
import { reactive } from "../reactive";

describe('reactive', () => {
    it('happy path', () => {
        const original = { foo: 1 }
        const observed = reactive(original);
        expect(observed).not.toBe(original);
        expect(original.foo).toBe(1);
    });
})