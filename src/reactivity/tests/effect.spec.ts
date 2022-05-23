/*
 * @Author: tywd
 * @Date: 2022-05-23 22:00:23
 * @LastEditors: tywd
 * @LastEditTime: 2022-05-23 22:22:40
 * @FilePath: /guide-mini-vue3/src/reactivity/tests/effect.spec.ts
 * @Description: Do not edit
 */
import { reactive } from "../reactive";
import { effect } from "../effect";

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
