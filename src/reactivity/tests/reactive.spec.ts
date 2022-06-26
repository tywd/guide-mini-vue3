/**
 * @Author: tywd
 * @Date: 2022-05-23 22:03:24
 * @LastEditors: tywd
 * @LastEditTime: 2022-06-26 23:24:51
 * @FilePath: /guide-mini-vue3/src/reactivity/tests/reactive.spec.ts
 * @Description: reactive isProxy test
 */
import { isReactive, reactive, isProxy } from "../reactive";

describe('reactive', () => {
    it('happy path', () => {
        const original = { foo: 1 }
        const observed = reactive(original);
        expect(observed).not.toBe(original);
        expect(original.foo).toBe(1);

        expect(isReactive(observed)).toBe(true);
        expect(isReactive(original)).toBe(false);

        expect(isProxy(observed)).toBe(true);
    });

    test("nested reactive", () => {
        const original = { nested: { foo: 1 }, array: [{ bar: 2 }] }
        const observed = reactive(original);
        expect(isReactive(observed.nested)).toBe(true);
        expect(isReactive(observed.array)).toBe(true);
        expect(isReactive(observed.array[0])).toBe(true);
    })
})