/**
 * @Author: tywd
 * @Date: 2022-07-04 21:17:17
 * @LastEditors: tywd
 * @LastEditTime: 2022-07-05 22:59:44
 * @FilePath: /guide-mini-vue3/example/App.js
 * @Description: 
 */
import { h } from "../../lib/guide-mini-vue.esm.js"
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