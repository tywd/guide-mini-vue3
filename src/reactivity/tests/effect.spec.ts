/*
 * @Author: tywd
 * @Date: 2022-05-23 22:00:23
 * @LastEditors: tywd
 * @LastEditTime: 2022-05-24 10:03:11
 * @FilePath: /guide-mini-vue3/src/reactivity/tests/effect.spec.ts
 * @Description: Do not edit
 */
import { reactive } from "../reactive";
import { effect } from "../effect";

describe('effect', () => {
    it('happy path', () => {
        const user = reactive({
            age: 10
        })
        expect(user.age).toBe(10)
        // user.age++

        let nextAge;
        effect(() => {
            nextAge = user.age + 1
        })
        expect(nextAge).toBe(11)

        // update
        user.age++;
        expect(nextAge).toBe(12)
    })

    it('should return runner when call effect', () => {
        // 1.effect(fn) -> function(runner) -> fn ->return
        let foo = 10;
        const runner = effect(() => {
            foo++;
            return "foo";
        });
        expect(foo).toBe(11);
        const r = runner();
        expect(foo).toBe(12);
        expect(r).toBe("foo");
    })

    it("scheduler", () => {
        // 1. 通过 effect 的第二个参数给定的 一个 scheduler 的 fn
        // 2. effect 第一次执行的时候 还会执行 fn 所以 dummy === toBe(1) 成立
        // 3. 当响应式对象 set update (即 obj.foo++ ) 不会执行 effect 里的 fn 而是执行一次 scheduler 
        // 4. 当执行 runner 的时候，才会再次执行 fn 将 obj.foo++ 后的值赋给dummy 所以最后 toBe(2)
        let dummy;
        let run: any;
        const scheduler = jest.fn(() => { // jest.fn 返回一个新的、未使用的模拟函数。可选地采用模拟实现。
          run = runner;
        });
        const obj = reactive({ foo: 1 });
        const runner = effect(
          () => {
            dummy = obj.foo;
          },
          { scheduler }
        );
        expect(scheduler).not.toHaveBeenCalled(); // 一开始不会被调用
        expect(dummy).toBe(1);
        // should be called on first trigger
        obj.foo++;
        expect(scheduler).toBeCalledTimes(1); // 模拟调用函数几次，1表示只被调用1次
        // should not run yet
        expect(dummy).toBe(1);
        // manually run
        run();
        // should have run
        expect(dummy).toBe(2);
      });
})
