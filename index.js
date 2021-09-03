// 响应式实现
let activeEffect;

class Dep {
    constructor() {
        this.subscribers = new Set();
    }
    
    depend() {
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

function reactive(raw) {
    Object.keys(raw).forEach(key => {
        // 为每个key都创建一个依赖对象
        const dep = new Dep();

        let realValue = raw[key];
        Object.defineProperty(raw, key, {
            get() {
                // 收集
                dep.depend();
                return realValue;
            },
            set(newValue) {
                realValue = newValue;
                // 通知
                dep.notify();
            }
        });
    })
}
//====================================================
const dep = new Dep();

let actualCount = 0;

const state = {
    get count() {
        dep.depend();
        return actualCount;
    },
    set count(count) {
        actualCount = count;
        dep.notify();
    }
}

watchEffect(() => {
    console.log('state.count :>> ', state.count);
})
state.count = 9
