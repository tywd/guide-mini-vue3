/**
 * @Author: tywd
 * @Date: 2022-07-10 00:26:24
 * @LastEditors: tywd
 * @LastEditTime: 2022-09-04 15:03:33
 * @FilePath: /guide-mini-vue3/src/runtime-core/componentPublicInstance.ts
 * @Description: 
 */
const publicPropertiesMap = {
    $el: (i) => i.vnode.el
}

export const PublicInstanceProxyHandlers = {
    get({ _: instance }, key) {
        const { setupState } = instance
        if (key in setupState) {
            return setupState[key]
        }
        // 访问 this.$el 时 key -> $el
        /* if (key === '$el') {
            return instance.vnode.el
        } */

        // 这样可以省去 多个 if 判断写法，因为vue3 也支持 option Api
        const publicGetter = publicPropertiesMap[key]
        if (publicGetter) {
            return publicGetter(instance)
        }

        // vue3 也支持 option Api，所 以也能访问比如以下属性，均可直接配置在 publicPropertiesMap
        // $options
        // $data 
    }
}