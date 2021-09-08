// 响应式实现
// 存放watcher
let activeEffect;
// 每次 new Dep()都会生成一个发布者实例
class Dep {
    constructor(value) {
        // 缓存列表以、防止列表中添加多个完全相同的函数
        this.subscribers = new Set();
        // 初始值
        this._value = value;
    }
    get value() {
        // 触发依赖收集
        this.depend();
        return this._value;
    }
    set value(value) {
        this._value = value;
        // 发布通知
        this.notify();
    }

    depend() {
        // 防止非watchEffect的中函数触发getter的时候也执行依赖收集
        if (activeEffect) {
            this.subscribers.add(activeEffect);
        }
    }
    notify() {
        this.subscribers.forEach(effect => effect());
    }
}

function watchEffect(effect) {
    activeEffect = effect;
    effect();
    activeEffect = null;
}

function reactiveByProxy(raw) {
    // 不用遍历了
    return new Proxy(raw, {
        get(target, key) {
            const value = getDep(target, key).value;
            if (value && typeof value === 'object') {
                // 递归
                return reactiveByProxy(value);
            } else {
                return value;
            }
        },
        set(target, key, value) {
            getDep(target, key).value = value;
        }
    })
}
// 用于存放 reactiveByProxy 代理的对象以及他们的发布者对象集
const targetToHashMap = new WeakMap();

// 用到的时候再把它变成响应式对象
function getDep(target, key) {
    let depMap = targetToHashMap.get(target);
    if (!depMap) {
        depMap = new Map();
        targetToHashMap.set(target, depMap);
    }

    let dep = depMap.get(key);
    if (!dep) {
        dep = new Dep(target[key]);
        depMap.set(key, dep);
    }

    return dep;
}
//====================================================
const state = reactiveByProxy({
    count: 0
})

watchEffect(() => {
    console.log(state.count)
}) // 0


state.count++ // 1

