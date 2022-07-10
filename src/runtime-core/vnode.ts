import { ShapeFlags } from "../shared/ShapeFlags"

/**
 * @Author: tywd
 * @Date: 2022-07-04 21:47:26
 * @LastEditors: tywd
 * @LastEditTime: 2022-07-10 16:26:02
 * @FilePath: /guide-mini-vue3/src/runtime-core/vnode.ts
 * @Description: 
 */
export function createVnode(type, props?, children?) {
    // console.log('type, props, children: ', type, props, children);
    const vnode = {
        type,
        props,
        children,
        el: null,
        shapeFlag: getShapeFlag(type)
    }

    // children 判断是什么 children 类型，可能是 text 或者 array
    if (typeof children === 'string') {
        vnode.shapeFlag |= ShapeFlags.TEXT_CHILDREN
    } else if (Array.isArray(children)) {
        vnode.shapeFlag |= ShapeFlags.ARRAY_CHILDREN
    }

    return vnode
}

const getShapeFlag = (type) => typeof type === 'string' ? ShapeFlags.ELEMENT : ShapeFlags.STATEFUL_COMPONENT