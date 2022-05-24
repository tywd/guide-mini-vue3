/*
 * @Author: tywd
 * @Date: 2022-05-23 22:00:23
 * @LastEditors: tywd
 * @LastEditTime: 2022-05-24 12:32:56
 * @FilePath: /guide-mini-vue3/src/reactivity/tests/effect.spec.ts
 * @Description: Do not edit
 */
import { reactive } from "../reactive";
import { effect, stop } from "../effect";

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

    it("stop", () => {
        let dummy;
        const obj = reactive({ prop: 1 });
        const runner = effect(() => {
          dummy = obj.prop;
        });
        obj.prop = 2;
        expect(dummy).toBe(2);
        
        // stop 后停止更新，obj.prop 怎么改 dummy 都会保持原值，除非再次执行runner
        // stop 时执行清空找到对应 track 收集起来的 dep 下的 effect，之后则不再会调用 effect fn
        stop(runner);

        // 上面stop后，因为下面这一行是只触发 set 的 trigger 函数，此时没有依赖 effect，所以 effect fn 并不执行，所以 dummy 不变，但 obj.prop 是有改变的
        obj.prop = 3;
        expect(dummy).toBe(2);
        
        // 上面执行 obj.prop=3 是没问题的，但执行 obj.prop++ 有问题
        // 因为它涉及到两步 obj.prop = obj.prop + 1
        /* 
        第一步是 obj.prop(get) 收集依赖，由于 stop 后依赖已被清除，即没有了 effect(()=>{}) 这个方法了，也就是依赖收集没用
        第二步是 obj.prop + 1(set) 触发依赖，由于上面 effect 被清除了，所以触发依赖的流程 调用了 effect.run() 也没用，obj.prop无法触发 dummy 更新，所以 +1 也没用就都报错了
        解决：在收集依赖 track 时做下处理加个参数 shouldTrack 来处理，让第二步 effect.run 时执行一次依赖收集 */
        // obj.prop++; 
        // expect(dummy).toBe(2);
    
        // stopped effect should still be manually callable
        runner(); // 执行runner后就会再次更新
        expect(dummy).toBe(3);
      });

    it("onStop", () => {
        const obj = reactive({
            foo: 1,
        });
        const onStop = jest.fn();
        let dummy;
        const runner = effect(
            () => {
                dummy = obj.foo;
            },
            {
                onStop,
            }
        );
        // 1、stop 时执行清空找到对应 track 收集起来的 dep 下的 effect， 之后则不再会调用effect fn
        stop(runner);
        // 2、清空的同时需要调用一次 effect 里的 onStop
        expect(onStop).toBeCalledTimes(1);
    });
})
