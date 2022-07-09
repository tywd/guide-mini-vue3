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
### 2.使用 rollup 打包库
安装
`yarn add rollup --dev`

根路径新建 `rollup.config.js`
rollup 天然支持 esm ，配置如下
```js
import typescript from "@rollup/plugin-typescript"
import pkg from './package.json'
export default {
    input: "./src/index.ts",
    output: [
        // 1.cjs -> common.js
        // 2.esm -> module
        {
            format: "cjs",
            file: pkg.main
        },
        {
            format: "es",
            file: pkg.module
        },
    ],
    plugins: [
        typescript()
    ]
}
```

安装插件解析ts `yarn add @rollup/plugin-typescript --dev`

安装 `yarn add tslib --dev `,打到 lib 文件夹下

配置命令在 `package.json`, 
```js
"main": "lib/guide-mini-vue.cjs.js",
"module": "lib/guide-mini-vue.esm.js",
...
"scripts": {
  "test": "jest",
  "build": "rollup -c rollup.config.js"
},
```
新建 `src/index.ts`
```js
export * from "./runtime-core";
```
修改 `src/runtime-core/index.ts`
```js
export { createApp } from "./createApp";
export { h } from "./h";
```

执行 `yarn build --watch`，watch 可监听修改自动 build

> 修改 `tsconfig.json` \
> 将 `"module": "commonjs"` 改为 `"module": "esnext"`，否则 build 会有警告\
> 将 `"moduleResolution": "node", ` 注释放开，否则 src/index.ts 会有报错 找不到 `./runtime-core`

此时 浏览器报错 找不到 instance.render 是正常现象

### 3.实现初始化 element 主流程
先对 App.js 加多点dom
```js
// App.js
// ...
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
// ...
```
修复 `main.js` 的 bug
```js
const rootContainer = document.getElementById('#app')  // 此处不应加 # 号， 上次commit 记录 笔主写错了
```
修改 `renderer.ts`
```js
// renderer.ts
// ...
function patch(vnode, container) {
    // check type of vnode  element 就处理element，如何区分element 和 component
    // console.log(vnode.type) // 可以看到首次挂在是个object 类型，挂的是 App.js 的组件，如果是string类型则直接是element
    if (typeof vnode.type === 'string') { // element
        processElement(vnode, container)
    } else if (isObject(vnode.type)) { // component
        processComponent(vnode, container)
    }
}

// 处理element类型
function processElement(vnode, container) {
    mountElement(vnode, container)
}

// 挂载element
function mountElement(vnode, container) {
    /* const el = document.createElement("div")
    el.textContent = 'hi mini-vue'
    el.setAttribute('id', 'root')
    document.body.append(el) */

    // 对应  App.js 中的
    /* h('div', {
        id: 'root',
        class: ['red', 'blue']
    }, 
    'hi, ' + this.msg) */

    const { type, children, props } = vnode
    // type  
    const el = document.createElement(type)
    // children  string, array
    if (typeof children === 'string') {
        el.textContent = children
    } else if (Array.isArray(children)) {
        mountChildren(vnode.children, el)
    }
    // props
    for (const key in props) {
        if (Object.prototype.hasOwnProperty.call(props, key)) {
            const val = props[key]
            el.setAttribute(key, val)
        }
    }
    container.append(el)
}

// 嵌套 children 类型 继续进行 patch
function mountChildren(children, container) {
    children.forEach(v => {
        patch(v, container)
    });
}
```

### 4.实现组件代理对象
 - 在组件里访问 setupState

    将 App.js 中的 setup 返回值给到 render 渲染的组件里，使组件可以访问 this ，进而可以访问 setup 的返回值
 - 使组件里可以访问到 $el  

    组件实例正在管理的根 DOM 节点。 https://vuejs.org/api/component-instance.html#el

    这里其实是 this.$el -> get root element，返回的是自己这个组件的根节点 dom实例

#### 在组件里访问 setupState
##### 1.组件初始化时先创建一个代理对象 Proxy
```js
// component.ts
export function createComponentInstance(vnode: any) {
    const component = {
        vnode,
        type: vnode.type,
        setupState: {} // 创建组件实例时初始化一个 setupeState，该值是 执行 setup 后的结果 +++++++++++
    }

    return component
}
// ...
function setupStateFulComponent(instance: any) {
    const Component = instance.type // 由于在 createComponentInstance 赋值了type， 所以 instance.type 等价于 instance.vnode.type
    // 引入代理 ++++++++++++++++
    instance.proxy = new Proxy({}, {
        get(target, key) {
            const { setupState } = instance
            if (key in setupState) {
                return setupState[key]
            }
        }
    })
    const { setup } = Component  // 传进来的 App或者子组件 的 setup
    if (setup) {
        const setupResult = setup()
        handleSetupResult(instance, setupResult)
    }
}
// ...
```
 
##### 2.将代理对象 Proxy 绑定到 render 上
在render执行时，将代理对象 Proxy 绑定到 render 上，即在 setupRenderEffect 方法中渲染 component，执行 render 时就取到了代理对象 Proxy
```js
// renderer.ts
// ...
function setupRenderEffect(instance, container) {
    const { proxy } = instance
    const subTree = instance.render.call(proxy)
    // vnode -> patch
    // vnode -> element -> mountElement
    patch(subTree, container)
}
// ...
```
此时 再将 App.js 的render 方法改下访问 this，即可访问到 setup 里 return 的对象\
访问 this 时触发 setupStateFulComponent 方法里 之前代理好的 instance.proxy 的 get
```js
render() {
    return h('div', {
        id: "root",
        class: ["root", "head"]
    },
    'hi ' + this.msg // this.msg 打印的是 setup 里的值
    );
},
```

#### 使组件里可以访问到 $el

##### 1. 访问 $el 时触发 Proxy 将 el 返回
首先，创建虚拟节点 createVnode 方法中初始一个 el
```js
// vnode.ts
export function createVnode(type, props?, children?) {
    const vnode = {
        type,
        props,
        children,
        el: null  // 初始el ++++++++
    }

    return vnode
}
```
其次，在访问 this.$el 时，触发 setupStateFulComponent 方法里之前代理好的 instance.proxy 的 get 访问到 key 为 $el，此时取到初始化 vnode 的 el 返回
```js
// component.ts
function setupStateFulComponent(instance: any) {
    const Component = instance.type // 由于在 createComponentInstance 赋值了type， 所以 instance.type 等价于 instance.vnode.type
    // 引入代理
    instance.proxy = new Proxy({}, {
        get(target, key) {
            const { setupState } = instance
            if (key in setupState) {
                return setupState[key]
            }
            // ++++++++++++++++
            if (key === '$el') {
                return instance.vnode.el
            }
            // ++++++++++++++++
        }
    })
    const { setup } = Component  // 传进来的 App或者子组件 的 setup
    if (setup) {
        const setupResult = setup()
        handleSetupResult(instance, setupResult)
    }
}
```
最后，只需在 createElement 时，将 element 整个 dom 节点 给到 instance.vnode.el 即可
```js
// renderer.ts
// ...
function mountElement(vnode, container) {
    const { type, children, props } = vnode
    // type  
    const el = (vnode.el = document.createElement(type)) // 将 vnode.el 绑定 ++++++++++++
    // children  string, array
    if (typeof children === 'string') {
        el.textContent = children
    } else if (Array.isArray(children)) {
        mountChildren(vnode.children, el)
    }
    // props
    for (const key in props) {
        if (Object.prototype.hasOwnProperty.call(props, key)) {
            const val = props[key]
            el.setAttribute(key, val)
        }
    }
    container.append(el)
}
function mountComponent(initialVnode, container) {
    const instance = createComponentInstance(initialVnode)
    // 绑定 setup 和 render 给到组件实例 instance，并执行组件的 setup 获得 return 的值
    setupComponent(instance)
    // 执行组件的 render 
    setupRenderEffect(instance, initialVnode, container) // 继续往下传入 initialVnode ，用于绑定 +++++++++ 
}

function setupRenderEffect(instance, initialVnode, container) {
    const { proxy } = instance
    const subTree = instance.render.call(proxy)

    // vnode -> patch
    // vnode -> element -> mountElement
    patch(subTree, container)
    
    // 获取初始化完成(element -> mount挂载之后)之后的el，
    // 挂载完成后的 subTree 结构大致如下
    /* {
        children:[],
        props: {},
        type: '',
        el: '#root'
    } */
    // 把当前subTree根(root)节点的el赋值给(initialVnode)的el
    initialVnode.el = subTree.el // ++++++++++++++
}
```
验证，将this绑定给 window.self.$el 浏览器控制台访问就可得到 dom 节点 el
```js
// App.js
// ...
render() {
    window.self = this  // +++++++++++++++
    return h('div', {
        id: "root",
        class: ["root", "head"]
    },
    'hi ' + this.msg
    // [
    //     h("p", {
    //         class: "red"
    //     }, "hi"),
    //     h("p", {
    //         class: "blue"
    //     }, "mini-vue")
    // ]
    );
}
// ...
```
结果
![image.png](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/cb99169973074c58b72819d3718e47cf~tplv-k3u1fbpfcp-watermark.image?)

> 重构代码，将 setupStateFulComponent 里绑定的代理对象 Proxy 抽离出来

新建 `src/runtime-core/componentPublicInstance.ts`
```js
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

        // vue3 也支持 option Api，所以也能访问比如以下属性，均可直接配置在 publicPropertiesMap
        // $options
        // $data 
    }
}
```
修改 `renderet.ts` 里的 `setupStateFulComponent` 方法
```js
// ...
// 处理子节点是组件类型的
function setupStateFulComponent(instance: any) {
    const Component = instance.type // 由于在 createComponentInstance 赋值了type， 所以 instance.type 等价于 instance.vnode.type
    // 引入代理
    instance.proxy = new Proxy({_: instance}, PublicInstanceProxyHandlers) // 将上面的get写法，改为引入抽离出来的handlers ++++++++++++
    const { setup } = Component  // 传进来的 App或者子组件 的 setup
    if (setup) {
        const setupResult = setup()
        handleSetupResult(instance, setupResult)
    }
}
// ...
```
