/**
 * @Author: tywd
 * @Date: 2022-07-10 00:26:24
 * @LastEditors: tywd
 * @LastEditTime: 2022-07-10 00:33:08
 * @FilePath: /guide-mini-vue3/src/runtime-core/componentPublicInstance.ts
 * @Description:
 */
const publicPropertiesMap = {
    $el: (i) => i.vnode.el
};
const PublicInstanceProxyHandlers = {
    get({ _: instance }, key) {
        const { setupState } = instance;
        if (key in setupState) {
            return setupState[key];
        }
        // 访问 this.$el 时 key -> $el
        /* if (key === '$el') {
            return instance.vnode.el
        } */
        // 这样可以省去 多个 if 判断写法，因为vue3 也支持 option Api
        const publicGetter = publicPropertiesMap[key];
        if (publicGetter) {
            return publicGetter(instance);
        }
        // vue3 也支持 option Api，所以也能访问比如以下属性，均可直接配置在 publicPropertiesMap
        // $options
        // $data 
    }
};

/**
 * @Author: tywd
 * @Date: 2022-07-04 22:02:41
 * @LastEditors: tywd
 * @LastEditTime: 2022-07-10 00:28:15
 * @FilePath: /guide-mini-vue3/src/runtime-core/component.ts
 * @Description: componnet 处理
 */
/**
 * @description 创建组件实例
 * @param vnode 虚拟节点 由于 传进来的 rootComponent 转换而来，首次是 App.js
 * @returns 返回一个组件实例对象
 */
function createComponentInstance(vnode) {
    const component = {
        vnode,
        type: vnode.type,
        setupState: {} // 创建组件实例时初始化一个 setupeState，该值是 执行 setup 后的结果
    };
    return component;
}
/**
 * @description 挂组件，初始化 props slots 等等
 * @param instance 上面 createComponentInstance 创建而来
 */
function setupComponent(instance) {
    // TODO
    // initProps()
    // initSlots()
    setupStateFulComponent(instance);
}
// 处理子节点是组件类型的
function setupStateFulComponent(instance) {
    const Component = instance.type; // 由于在 createComponentInstance 赋值了type， 所以 instance.type 等价于 instance.vnode.type
    // 引入代理
    instance.proxy = new Proxy({ _: instance }, PublicInstanceProxyHandlers);
    const { setup } = Component; // 传进来的 App或者子组件 的 setup
    if (setup) {
        const setupResult = setup();
        handleSetupResult(instance, setupResult);
    }
}
// 绑定 setup 的值供组件实例使用
function handleSetupResult(instance, setupResult) {
    // setup 可以返回一个 Function or Object
    // TODO function
    if (typeof setupResult === 'object') {
        instance.setupState = setupResult;
    }
    finishComponentSetup(instance);
}
// 绑定 render 供组件实例使用
function finishComponentSetup(instance) {
    const Component = instance.type;
    instance.render = Component.render;
}

function render(vnode, container) {
    patch(vnode, container);
}
function patch(vnode, container) {
    // check type of vnode  element 就处理element，如何区分element 和 component
    // console.log(vnode.type) // 可以看到首次挂在 是个object 类型，挂的是 App.js 的组件，如果是string类型则直接是element
    /* if (typeof vnode.type === 'string') { // element
        processElement(vnode, container)
    } else if (isObject(vnode.type)) { // component
        processComponent(vnode, container)
    } */
    const { shapeFlag } = vnode;
    console.log('shapeFlag: ', shapeFlag); // 具体打印说明查看 README.md 《实现 shapeFlags》 章节
    if (shapeFlag & 1 /* ShapeFlags.ELEMENT */) {
        processElement(vnode, container);
    }
    else if (shapeFlag & 2 /* ShapeFlags.STATEFUL_COMPONENT */) {
        processComponent(vnode, container);
    }
}
// 处理element类型
function processElement(vnode, container) {
    mountElement(vnode, container);
}
function mountElement(vnode, container) {
    /* const el = document.createElement("div")
    el.textContent = 'hi mini-vue'
    el.setAttribute('id', 'root')
    document.body.append(el) */
    // 对应 
    /* h('div', {
        id: 'root',
        class: ['red', 'blue']
    },
    'hi, ' + this.msg) */
    const { type, children, props, shapeFlag } = vnode;
    // type  
    const el = (vnode.el = document.createElement(type));
    // children  string, array
    /* if (typeof children === 'string') {
        el.textContent = children
    } else if (Array.isArray(children)) {
        mountChildren(vnode.children, el)
    } */
    if (shapeFlag & 4 /* ShapeFlags.TEXT_CHILDREN */) {
        el.textContent = children;
    }
    else if (shapeFlag & 8 /* ShapeFlags.ARRAY_CHILDREN */) {
        mountChildren(children, el);
    }
    // props
    for (const key in props) {
        if (Object.prototype.hasOwnProperty.call(props, key)) {
            const val = props[key];
            const isOn = (key) => /^on[A-Z]/.test(key); // 判断是否是onClick等一类on开头的事件
            if (isOn(key)) {
                // element事件添加
                const event = key.slice(2).toLowerCase();
                el.addEventListener(event, val);
            }
            else {
                // element属性添加
                el.setAttribute(key, val);
            }
        }
    }
    container.append(el);
}
// 嵌套 children 类型 继续进行 patch
function mountChildren(children, container) {
    children.forEach(v => {
        patch(v, container);
    });
}
// 处理组件类型
function processComponent(vnode, container) {
    mountComponent(vnode, container);
}
/**
 * @description 挂载组件 包括执行 setup
 * @param vnode 被挂载的虚拟节点
 * @param container 挂载节点的父容器
 */
function mountComponent(initialVnode, container) {
    // 挂在组件时，创建一个组件实例，方便之后直接从实例中获取各项值
    const instance = createComponentInstance(initialVnode);
    // 绑定 setup 和 render 给到组件实例 instance，并执行组件的 setup 获得 return 的值
    setupComponent(instance);
    // 执行组件的 render 
    setupRenderEffect(instance, initialVnode, container);
}
/**
 * @description 执行 render 递归调用 patch 重复 拆组件的子组件
 * @param instance 组件实例
 * @param container 挂在节点的父容器
 */
function setupRenderEffect(instance, initialVnode, container) {
    const { proxy } = instance;
    const subTree = instance.render.call(proxy);
    // vnode -> patch
    // vnode -> element -> mountElement
    patch(subTree, container);
    // 获取初始化完成(element -> mount挂载之后)之后的el，
    // 挂载完成后的 subTree 结构大致如下
    /* {
        children:[],
        props: {},
        type: '',
        el: '#root'
    } */
    // 把当前subTree根(root)节点的el赋值给(initialVnode)的el
    initialVnode.el = subTree.el;
}

/**
 * @Author: tywd
 * @Date: 2022-07-04 21:47:26
 * @LastEditors: tywd
 * @LastEditTime: 2022-07-10 16:26:02
 * @FilePath: /guide-mini-vue3/src/runtime-core/vnode.ts
 * @Description:
 */
function createVnode(type, props, children) {
    // console.log('type, props, children: ', type, props, children);
    const vnode = {
        type,
        props,
        children,
        el: null,
        shapeFlag: getShapeFlag(type)
    };
    // children 判断是什么 children 类型，可能是 text 或者 array
    if (typeof children === 'string') {
        vnode.shapeFlag |= 4 /* ShapeFlags.TEXT_CHILDREN */;
    }
    else if (Array.isArray(children)) {
        vnode.shapeFlag |= 8 /* ShapeFlags.ARRAY_CHILDREN */;
    }
    return vnode;
}
const getShapeFlag = (type) => typeof type === 'string' ? 1 /* ShapeFlags.ELEMENT */ : 2 /* ShapeFlags.STATEFUL_COMPONENT */;

/**
 * @Author: tywd
 * @Date: 2022-07-04 21:25:35
 * @LastEditors: tywd
 * @LastEditTime: 2022-07-04 21:56:02
 * @FilePath: /guide-mini-vue3/src/runtime-core/createApp.ts
 * @Description:
 */
function createApp(rootComponent) {
    return {
        mount(rootContainer) {
            // vnode
            // component -> vnode
            // 所有的逻辑操作都会基于 vnode 操作
            const vnode = createVnode(rootComponent);
            render(vnode, rootContainer);
        }
    };
}

function h(type, props, children) {
    return createVnode(type, props, children);
}

export { createApp, h };
