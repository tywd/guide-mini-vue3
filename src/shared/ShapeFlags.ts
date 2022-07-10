/**
 * @Author: tywd
 * @Date: 2022-07-10 12:02:21
 * @LastEditors: tywd
 * @LastEditTime: 2022-07-10 13:54:26
 * @FilePath: /guide-mini-vue3/src/shared/ShapeFlags.ts
 * @Description: 枚举 位运算 来判断 type 类型
 */
export const enum ShapeFlags {
    ELEMENT = 1, // 0001
    STATEFUL_COMPONENT = 1 << 1, // 0010
    TEXT_CHILDREN = 1 << 2, // 0100
    ARRAY_CHILDREN = 1 << 3, // 1000
}