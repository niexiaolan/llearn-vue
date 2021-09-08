// vue-router初代实现

// 全局注册
let _Vue = null;

export default class VueRouter {
    // 初始化
    init() {
        // 解析路由
        this.createRouterMap();
        // 初始化组件
        this.initComponent(_Vue);
        // 监听事件
        this.initEvent()
    }
    constructor(options) {
        this.options = options;
        this.routerMap = {};
        // 数据是响应式的
        this.data = _Vue.observable({
            // 当前路由地址
            current: '/'
        })
    }
    // install 实现
    static install(Vue) {
        // 判断是否注册
        if (VueRouter.install.installed) return
        VueRouter.install.installed = true;
        // 保存 Vue
        _Vue = Vue;
        // 拿到this
        _Vue.mixin({
            beforeCreate() {
                if (this.$options.router) {
                    // 挂载
                    _Vue.prototype.$router = this.$options.router;
                    // 注册完之后初始化
                    this.$options.router.init();
                }
            },
        })
    }
    // 解析路由
    createRouterMap() {
        // 遍历routers
        this.options.routers.forEach((item) => {
            // 把路由和组件的关系添加到routerMap中
            this.routerMap[item.path] = item.component;
        })
    }

    initComponent(Vue) {
        // 实现<router-link></router-link>
        Vue.component('router-link', {
            props: {
                to: String,
            },
            // 由于运行版的Vue不能渲染template所以这里重新写个render 这里h 也是个函数
            // template: `<a :href="to"><slot></slot></a>`,
            render(h) {
                // 第一个参数是标签
                return h(
                    'a',
                    // 第二个参数是对象是 tag 里面的属性
                    {
                        // 设置属性
                        attrs: {
                            href: this.to,
                        },
                        // 绑定事件
                        on: {
                            // 重新复写点击事件,不写的话会点击会向服务器发送请求刷新页面
                            click: this.onClick,
                        },
                    },
                    // 这个是标签里面的内容 这里渲染是 默认插槽
                    [this.$slots.default]
                )
            },
            methods: {
                //点击事件
                onClick(e) {
                    // 默认history
                    // 第一个参数是传递的参数,第二个是标题，第三个是链接
                    history.pushState({}, '', this.to);
                    // 渲染的页面也需要改变 data中的current是响应式的 router-view是根据current来渲染的
                    this.$router.data.current = this.to
                    // 阻止默认跳转
                    e.preventDefault()
                }

            }
        })

        // 实现router-view
        Vue.component('router-view', {
            render(h) {
                // 获取的当前路径所对应的组件
                // 因为当前this是Vue,this.$router才是VueRouter
                const component = this.$router.routerMap[this.$router.data.current]
                // 转化为虚拟Dom
                return h(component)
            },
        })
    }
    // 实现前进后退
    initEvent() {
        window.addEventListener('popstate', () => {
            // 当浏览器前进或后退时，触发
            this.data.current = window.location.pathname
        })
    }


}