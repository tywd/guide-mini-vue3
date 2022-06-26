/**
 * @Author: tywd
 * @Date: 2022-06-25 14:21:18
 * @LastEditors: tywd
 * @LastEditTime: 2022-06-26 16:58:12
 * @FilePath: /guide-mini-vue3/src/reactivity/tests/shallowReadonly.spec.ts
 * @Description: shallowReadonly 只有第一层是 readonly ，第二层以及之后的内层 不为 readonly
 */
import { shallowReadonly, isReadonly } from "../reactive";

describe('shallowReadonly', () => {
    it('should not make non-readonly properties readonly ', () => {
        const props = shallowReadonly({ n: { foo: 1 } })
        expect(isReadonly(props)).toBe(true); 
        expect(isReadonly(props.n)).toBe(false);
    });

    // 第一层为 readonly 所以 user.age 应当不可被修改而触发 console.warn 执行
    it('warn then call set ', () => {
        // jest.fn 来验证 console.warn有没被调用到
        console.warn = jest.fn();
        const user = shallowReadonly({
            age: 10
        })
        user.age = 11

        expect(console.warn).toBeCalled(); // 验证当set的时候有没有调用console.warn方法执行警告
    });

    // 第二层以及之后的内层 不为 readonly 所以 user.age.new 应当可被修改而不触发 console.warn 执行
    it('warn then not call set ', () => {
        // jest.fn 来验证 console.warn有没被调用到
        console.warn = jest.fn();
        const user = shallowReadonly({
            age: { new: 10 }
        })
        user.age.new = 11

        expect(console.warn).not.toBeCalled() // 验证当set的时候有没有调用console.warn方法执行警告
    });
})