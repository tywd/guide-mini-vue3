/**
 * @Author: tywd
 * @Date: 2022-07-04 21:17:17
 * @LastEditors: tywd
 * @LastEditTime: 2022-07-04 22:18:48
 * @FilePath: /guide-mini-vue3/example/App.js
 * @Description: 
 */
export const App = {
    // .vue
    // <template></template>
    // render
    render() {
        return h('div', 'ty，', this.msg)
    },

    setup() {
        // componition Api
        return {
            msg: 'hello mini-vue'
        }
    }
}