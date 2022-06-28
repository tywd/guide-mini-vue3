/**
 * @Author: tywd
 * @Date: 2022-06-28 21:29:46
 * @LastEditors: tywd
 * @LastEditTime: 2022-06-28 22:15:19
 * @FilePath: /guide-mini-vue3/src/reactivity/tests/computed.spec.ts
 * @Description: computed 接受一个 `getter` 函数，返回一个只读的响应式 `ref` 对象，即 `getter` 函数的返回值。
 * 它也可以接受一个带有 `get` 和 `set` 函数的对象来创建一个可写的 `ref` 对象
 */
import { computed } from "../computed";
import { reactive } from "../reactive";

describe("computed", () => {
    it("happy path", () => {
        // 调用 .value
        const user = reactive({
            age: 1,
        });

        const age = computed(() => {
            return user.age;
        });

        expect(age.value).toBe(1);
    });

    // 有缓存功能
    it("should compute lazily", () => {
      const value = reactive({
        foo: 1,
      });
      const getter = jest.fn(() => {
        return value.foo;
      });
      const cValue = computed(getter);
  
      // lazy
      expect(getter).not.toHaveBeenCalled(); // 一开始不会被调用， 除非使用 .value
  
      expect(cValue.value).toBe(1);
      expect(getter).toHaveBeenCalledTimes(1); // 当访问 cValue.value 时验证 getter 是否被调用了一次
  
      // should not compute again
      cValue.value; // get 二次访问 .value 会返回缓存的值
      expect(getter).toHaveBeenCalledTimes(1); // 不管执行 cValue.value 都应该让 getter 方法还是只应该被调用过一次，不应该再次被调用
  
      // should not compute until needed
      value.foo = 2; // 执行了 trigger -> 所以必须有对应的 effect.run()，则需要先进行 track 收集依赖，利用 ReativeEffect 来执行
      expect(getter).toHaveBeenCalledTimes(1); // 访问的是 reactive 包裹的 value.foo ，所以 getter 应该是只被调用过一次
  
      // now it should compute
      expect(cValue.value).toBe(2);
      expect(getter).toHaveBeenCalledTimes(2);
  
      // should not compute again
      cValue.value;
      expect(getter).toHaveBeenCalledTimes(2);
    });
});
