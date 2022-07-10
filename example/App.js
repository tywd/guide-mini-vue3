/**
 * @Author: tywd
 * @Date: 2022-07-04 21:17:17
 * @LastEditors: tywd
 * @LastEditTime: 2022-07-10 15:57:13
 * @FilePath: /guide-mini-vue3/example/App.js
 * @Description: 
 */
import { h } from "../../lib/guide-mini-vue.esm.js"

window.self = null
export const App = {
    // .vue
    // <template></template>
    // render
    render() {
        window.self = this
        return h('div', {
            id: "root",
            class: ["root", "head"]
        },            
        // setupState
        // this.$el -> get root element
        // 'hi ' + this.msg
        [
            h("p", {
                class: "red"
            }, "hi"),
            h("p", {
                class: "blue"
            }, this.msg)
        ]
        );
    },

    setup() {
        // componition Api
        return {
            msg: 'mini-vue'
        }
    }
}