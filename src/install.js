import View from './components/view'
import Link from './components/link'

export let _Vue

export function install (Vue) {
  if (install.installed && _Vue === Vue) return
  install.installed = true

  _Vue = Vue

  const isDef = v => v !== undefined // 检测是否未定义

  // 组件rooter-view的数据方法
  const registerInstance = (vm, callVal) => {
    let i = vm.$options._parentVnode

    // 等同于检测i.data.registerRouteInstance是否存在
    // 在rooter-view指向的子组件创建前，进行调用
    if (isDef(i) && isDef(i = i.data) && isDef(i = i.registerRouteInstance)) {
      i(vm, callVal)
    }
  }

  // 全局混入
  Vue.mixin({
    beforeCreate () {
      // router是否存在,如果存在，即为app组件
      if (isDef(this.$options.router)) {
        // 存储注册router的根组件实例
        this._routerRoot = this

        // VueRouter实例
        this._router = this.$options.router
        this._router.init(this)

        // 给this._route赋值当前路由，并reactive化，当发生变化时，将引起组件重绘
        Vue.util.defineReactive(this, '_route', this._router.history.current)
      } else {
        // 子组件的_routerRoot指向注册rooter的顶层组件
        this._routerRoot = (this.$parent && this.$parent._routerRoot) || this
      }
      registerInstance(this, this)
    },
    destroyed () {
      registerInstance(this)
    }
  })

  // 使组件this.$router = this._routerRoot._router
  Object.defineProperty(Vue.prototype, '$router', {
    get () { return this._routerRoot._router }
  })

  // 使组件this.$route = this._routerRoot._route
  Object.defineProperty(Vue.prototype, '$route', {
    get () { return this._routerRoot._route }
  })

  // 注册rooter-view和router-link
  Vue.component('RouterView', View)
  Vue.component('RouterLink', Link)

  const strats = Vue.config.optionMergeStrategies
  // use the same hook merging strategy for route hooks
  strats.beforeRouteEnter = strats.beforeRouteLeave = strats.beforeRouteUpdate = strats.created
}
