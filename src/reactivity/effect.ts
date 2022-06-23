/*
 * @Author: tywd
 * @Date: 2022-05-23 22:00:36
 * @LastEditors: tywd 1042048096@qq.com
 * @LastEditTime: 2022-06-23 23:48:47
 * @FilePath: /guide-mini-vue3/src/reactivity/effect.ts
 * @Description: effect 实现
 */
import { extend } from "./shared";
let activeEffect,shouldTrack; // shouldTrack 是否应该收集依赖
class ReactiveEffect {
    private _fn: any
    public scheduler: Function | undefined;
    private deps: []
    private active: boolean = true // 只清除一次依赖就行，用该参数处理，避免外部频繁调用stop清除 effect
    public onStop?: () => void // stop 被调用后 执行一次 onStop
    constructor(fn, scheduler?) {
        this._fn = fn;
        this.scheduler = scheduler
        this.deps = []
    }
    run() {
        if(!this.active) return this._fn();
        shouldTrack = true; // 表示可收集依赖
        activeEffect = this;  // 一开始就将 ReactiveEffect 实例 存在全局变量 activeEffect
        // this._fn();
        // return this._fn();
        const result = this._fn();
        shouldTrack = false // fn执行后 触发了get track 收集依赖后 就关上 shouldTrack 下次没必要收集，主要用于应对 stop runner 后的操作
        return result;
    }
    stop() {
        if (this.active) { // 避免外部频繁调用 stop 来清空effect，加个 active 标记一下
            // 1、执行 stop 时 清空对应 dep 下的 effect，让 effect 方法不再触发
            cleanupEffect(this);
            // 清空的同时需要在执行一次 effect 里的 onStop
            if (this.onStop) {
                this.onStop()
            }
            this.active = false
        }
    }
}

function cleanupEffect(effect) {
    effect.deps.forEach((dep: any) => {
        dep.delete(effect)
    })
    effect.deps.length = 0
}

/**
 * @Descripttion: effect 执行传进来的方法
 * @param fn {function}
 * @return {*}
 */
export function effect(fn, options: any = {}) {
    const scheduler = options.scheduler
    
    const _effect = new ReactiveEffect(fn, scheduler); // 用类来收集

    // _effect.onStop = options.onStop; // 将外部 stop 后需要执行的 onStop 给到我们的 ReactiveEffect，可重构
    // !重构, 直接将传过来的所有 options 参数跟_effect 合并
    extend(_effect, options)

    _effect.run(); // 会触发 reactive里 proxy 的 get 从而触发 track，此时 run 后的 activeEffect 已经绑定
    const runner: any = _effect.run.bind(_effect);
    runner.effect = _effect
    return runner;
}

const targetMap = new Map(); // 定义一个全局的 Map 用于收集 reactive 传进的 object 的依赖
/**
 * @Descripttion: 触发 reactive里 proxy 的 get 时会 收集依赖
 * @param target {object} reactive 传入的
 * @param key {object.key} reactive 传入 object下的key
 * @return {*}
 */
export function track(target, key) {
    // 1、一开始未进行 new ReactiveEffect() 时，activeEffect 为空，track 不进行依赖收集，所以vue内部一开始是有执行行一次effect方法
    // 2、当 effect 被执行时，ReactiveEffect 才会被实例化，调用run 方法，将该实例给到 activeEffect，之后的 track 依赖收集才有意义
    // 3、将 effect 理解成 提供一个依赖函数就可以
    if (!activeEffect) return; // 由于track 是只要执行 Proxy 的get就会触发，但如果 effect 方法未被定义，activeEffect是没用的，所以如果没有activeEffect，就不应走下面代码
    if (!shouldTrack) return; // shouldTrack 是否应该收集依赖
    let depsMap = targetMap.get(target) // 得到 reactive 传进的 object 的值
    if (!depsMap) {
        depsMap = new Map()
        targetMap.set(target, depsMap)
    }

    let dep = depsMap.get(key) // 得到 reactive 传进的 object 的 key 的值
    if (!dep) {
        dep = new Set()
        depsMap.set(key, dep)
    }

    if (dep.has(activeEffect)) return; // 依赖已收集则直接 return

    // 1、将一开始实例后的 ReactiveEffect 依赖收集存入 dep，
    // 2、等待 trigger 触发
    dep.add(activeEffect);

    // 1、vue3 的设计是 需要使用 ReactiveEffect 的 stop 方法来清除依赖
    // 但我们的 ReactiveEffect 实例里面并没有收集过 dep，那执行 stop 就不能清除 dep 下的 effect
    // 2、所以此处反向收集一下我们的 dep，给到当前实例化后的 activeEffect
    // 3、需要为 ReactiveEffect 新增一个 deps 数组用于收集，清空后的结果可以看 stop 方法注释
    activeEffect.deps.push(dep);
}

/**
 * @Descripttion: 触发 reactive里 proxy 的 set 时会 触发依赖
 * @param target {object}
 * @param key 
 * @param value
 * @return {*}
 */
export function trigger(target, key) {
    // 1、找依赖，我们在 track 已经收集过
    // 2、通过 reactive 传进的 object 先找到整个 object 的依赖，
    let depsMap = targetMap.get(target)
    // 3、接着找到 object.key 的依赖
    let dep = depsMap.get(key)
    for (const effect of dep) {
        if (effect.scheduler) {
            effect.scheduler()
        } else {
            effect.run() // 4、执行 track 时收集进来的依赖实例的 run(), 则会再一次调用了 effect，完成响应式更新
        }
    }
}

export function stop(runner) {
    // 执行 stop 时清空找到对应 track 收集起来的 dep 下的 effect，之后则不再会调用 effect fn
    runner.effect.stop(); // 此时我们的 targetMap 对应的 depsMap 下的 dep 则被清除了，打印如下
    // console.log('targetMap', targetMap)
    // 对应的 dep -> 即 Set(1) {[ReactiveEffect]} 变为了 -> Set(0) {}
    /* targetMap Map(3) {
        { age: 11 } => Map(1) { 'age' => Set(1) { [ReactiveEffect] } },
        { foo: 2 } => Map(1) { 'foo' => Set(1) { [ReactiveEffect] } },
        { prop: 2 } => Map(1) { 'prop' => Set(0) {} }
    } */
}