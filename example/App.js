/**
 * @Author: tywd
 * @Date: 2022-07-04 21:17:17
 * @LastEditors: tywd
 * @LastEditTime: 2022-07-09 20:54:21
 * @FilePath: /guide-mini-vue3/example/App.js
 * @Description: 
 */
import { h } from "../../lib/guide-mini-vue.esm.js"
export const App = {
    // .vue
    // <template></template>
    // render
    render() {
        return h('div', {
            id: "root",
            class: ["root", "head"]
        },
        // 'hi ' + this.msg
        [
            h("p", {
                class: "red"
            }, "hi"),
            h("p", {
                class: "blue"
            }, "mini-vue")
        ]);
    },

    setup() {
        // componition Api
        return {
            msg: 'mini-vue'
        }
    }
}