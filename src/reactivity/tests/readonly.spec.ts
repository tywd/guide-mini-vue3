/*
 * @Author: tywd
 * @Date: 2022-06-14 18:15:59
 * @LastEditors: tywd
 * @LastEditTime: 2022-06-15 00:48:02
 * @FilePath: /guide-mini-vue3/src/reactivity/tests/readonly.spec.ts
 * @Description: Readonly test
 */
import { isReadonly, readonly } from "../reactive";

describe('reactive', () => {
    it('happy path', () => {
        // not set
        const original = { foo: 1, bar: { baz: 2 } }
        const wrapped = readonly(original)
        expect(wrapped).not.toBe(original);
        expect(wrapped.foo).toBe(1);

        expect(isReadonly(wrapped)).toBe(true);
        expect(isReadonly(original)).toBe(false);
    });

    it('warn then call set ', () => {
        // jest.fn 来验证 console.warn有没被调用到
        console.warn = jest.fn();
        const user = readonly({
            age: 10
        })
        user.age = 11

        expect(console.warn).toBeCalled(); // 验证当set的时候有没有调用console.warn方法执行警告
    });
})
