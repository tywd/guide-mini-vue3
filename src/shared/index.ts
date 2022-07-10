/**
 * @Author: tywd
 * @Date: 2022-05-24 12:21:56
 * @LastEditors: tywd
 * @LastEditTime: 2022-06-26 16:31:33
 * @FilePath: /guide-mini-vue3/src/reactivity/shared/index.ts
 * @Description: 
 */
export const extend = Object.assign; // 如果希望防止合并时源对象被修改到，传值时第一个参数请设置为 {}，具体可参考 https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/assign

export const isObject = (val) => {
    return val !== null && typeof val === "object"
}

export const hasChanged = (val, newValue) => {
    return !Object.is(val, newValue); // 方法判断两个值是否为同一个值。
}

// 判断 key 是否在 val 的属性里
export const hasOwn = (val, key) => {
    return Object.prototype.hasOwnProperty.call(val, key)
}

export const camlize = (str: string) => {
    return str.replace(/-(\w)/g, (b, c: string) => { // /-(\w)/g 正则匹配所有的- 和 -后第一个字
        console.log('b: ', b); // b表示 获取的 -与-之后的第一个字母的拼接
        console.log('c: ', c); // c表示 -之后的第一个字母
        return c ? c.toUpperCase() : ""
    })
}

// 首字母取到并改成大写 + 除首字母之外的
const capitalize = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1)
}

export const toHandlerKey = (str: string) => {
    return str ? "on" + capitalize(str) : ""
}