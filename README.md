## 每次 commit 实现说明
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
