/*
 * @Author: tywd
 * @Date: 2022-05-23 21:43:48
 * @LastEditors: tywd
 * @LastEditTime: 2022-05-23 21:55:14
 * @FilePath: /guide-mini-vue3/src/reactivity/tests/index.spec.ts
 * @Description: Do not edit
 */
import { add } from '../index' // 需要babel转换才可使用 esModule 规范
it('init', () => {
    expect(add(1, 1)).toBe(2)
})