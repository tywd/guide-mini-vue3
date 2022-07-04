# 每次 commit 实现说明
看代码实现时可通过单元测试一步一步看，将不需要的注释掉

## 1.reactivity 模块
### 1.setup环境-集成jest做单元测试-集成 ts
配置jest typescript babel
jest 测试
### 2.实现 effect & reactive & 依赖收集 & 触发依赖

### 3.实现 effect 返回 runner
```js
let foo = 10;
const runner = effect(() => {
    foo++;
    return "foo";
});
runner(); // 需要支持返回
```
### 4.实现 effect 的scheduler 功能
```js
const num = reactive({ currentNum: 0})
const runner = () => {
  effect(
    () => {
      // 一开始就调用
      console.log('effect ', num.currentNum)
    },
    {
      scheduler: () => {
        // 一开始不会被调用，值变化后才会调用该 scheduler 方法而不调用 effect fn，之后会一直调用 scheduler，当runner被再次调用时才会继续执行effect里的fn
        // 如果未设置则一直保持执行 effect 里的fn
        console.log('effect-scheduler ', num.currentNum)
      }
    }
  )
}
runner()
```

### 5.实现 effect 的 stop 功能

```js
// 基于 第四点的代码，再加一个 onStop
const num = reactive({ currentNum: 0, chunks: [] })
const runner = () => {
  effect(
    () => {
      // 一开始就调用
      // console.log('effect ', num.currentNum)
      console.log('effect ', num.chunks)
    },
    {
        scheduler: () => {
            // 一开始不会被调用，值变化后才会调用该 scheduler 方法而不调用 effect fn，之后会一直调用 scheduler，当runner被再次调用时才会继续执行effect里的fn
            // 如果未设置则一直保持执行 effect 里的fn
            console.log('effect-scheduler ', num.currentNum)
        },
        onStop: () => {
          // 被stop后可调用一次
          console.log('effect 已被 stop')
        },
    }
  )
}
runner()
stop(runner) // stop后除非再执行一次 runner 否则 effect 将不会再执行
```
### 6.readonly实现 与 代码重构
https://staging-cn.vuejs.org/api/reactivity-core.html#readonly
### 7.isReative and isReadonly 实现
https://staging-cn.vuejs.org/api/reactivity-utilities.html#isreactive
### 8.effect 优化 stop 功能 满足 obj.prop++
```js  
  // obj.prop++ 
  // 因为它涉及到两步 obj.prop = obj.prop + 1
  /**
   * 第一步是 obj.prop(get) 收集依赖，由于 stop 后依赖已被清除，即没有了 effect(()=>{}) 这个方法了，我们 get 时又会去收集一次依赖，那 stop 不是白清除了？
   * 第二步是 obj.prop + 1(set) 触发依赖，调用了 effect.run() 所以又触发了 effect fn 使 dummy 更新成了 dummy = 3
   * 但我们希望是 stop 后就 effect fn 就不会被执行的，希望得到 dummy = 2，所以在这次的 get 中就不应再收集 effect，这样 trigger 时才不会触发 effect.run()
   * 解决：在收集依赖 track 时做下处理加个参数 shouldTrack 来处理, 不要再收集依赖即可，只要没有依赖，下次 trigger 触发时就不会调用 effect.run()
   */
```
### 9.reactive 与 readonly 嵌套实现
`reactive` 与 `readonly` 的深层嵌套应该具备相同的功能
### 10.shallowReactive 与 shallowReadonly 实现
https://staging-cn.vuejs.org/api/reactivity-advanced.html#shallowreactive

`shallowReactive()` 是 `reactive()` 的浅层作用形式。

`shallowReadonly()` 是 `readonly()` 的浅层作用形式。
### 11.isProxy 实现 
https://staging-cn.vuejs.org/api/reactivity-utilities.html#isproxy

检查一个对象是否是由 `reactive()`、`readonly()`、`shallowReactive()` 或 `shallowReadonly()` 创建的代理。

### 12.ref 实现 
https://staging-cn.vuejs.org/api/reactivity-core.html#ref

接受一个内部值，返回一个响应式的、可更改的 `ref` 对象，此对象只有一个指向其内部值的 property `.value`。

`ref` 对象是可更改的，也就是说你可以为 `.value` 赋予新的值。它也是响应式的，即所有对 `.value` 的操作都将被追踪，并且写操作会触发与之相关的副作用。

如果将一个对象赋值给 `ref` ，那么这个对象将通过 `reactive()` 转为具有深层次响应式的对象。这也意味着如果对象中包含了嵌套的 `ref` ，它们将被深层地解包。

若要避免这种深层次的转换，请使用 `shallowRef()` 来替代。

### 13.isRef/unRef
https://staging-cn.vuejs.org/api/reactivity-utilities.html#isref

`isRef` 检查某个值是否为 `ref`

https://staging-cn.vuejs.org/api/reactivity-utilities.html#unref

如果参数是 `ref` ，则返回内部值，否则返回参数本身。这是 `val = isRef(val) ? val.value : val` 计算的一个语法糖。

### 14.proxyRefs
https://github.com/vuejs/core/pull/1682

使用proxyRefs之后可省略ref的 .value语法

```js
export function proxyRefs(objectWithRefs) {
    return new Proxy(objectWithRefs, {
        get(target, key) {
            // isRef -> age = ref(10) return age.value (10)
            // not ref -> age = 10 return value (10)
            return unRef(Reflect.get(target, key))
        },

        set(target, key, value) {
            // isRef -> age = ref(10) -> 修改 age.value 
            // not ref -> age = 10 -> 修改 value 
            if(isRef(target[key]) && !isRef(value)) { // 旧值是 ref && 新值不是 ref 直接修改旧值的 ref.value
                return target[key].value = value
            } else {
                return Reflect.set(target, key, value)
            }
        }
    })
}
```
### 15.computed
https://staging-cn.vuejs.org/api/reactivity-core.html#computed

接受一个 `getter` 函数，返回一个只读的响应式 `ref` 对象，即 `getter` 函数的返回值。它也可以接受一个带有 `get` 和 `set` 函数的对象来创建一个可写的 `ref` 对象

## 2.runtime-core 模块
### 1.实现初始化 component 主流程
vue3 方法的挂载过程
```js
// App.js
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

// main.js
createApp(App).mount('#app')

// createApp.ts
import { render } from "./renderer"
import { createVnode } from "./vnode"

export function createApp(rootComponent) {
    return {
        mount(rootContainer) {
            // vnode
            // component -> vnode
            // 所有的逻辑操作都会基于 vnode 操作
            const vnode = createVnode(rootComponent)
            render(vnode, rootContainer)
        }
    }
}
```