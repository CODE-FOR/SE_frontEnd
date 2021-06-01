import Vue from 'vue'
import Router from 'vue-router'
import routes from './routers'
// import store from '@/store'
import iView from 'iview'
import { getToken, setTitle } from '@/libs/util' // setToken canTurnTo
import config from '@/config'
import store from '../store'
import { Message } from 'iview'
const { homeName } = config

Vue.use(Router)
const router = new Router({
  routes,
  mode: 'history'
})
const LOGIN_PAGE_NAME = 'login'
const WRITE_INTERPRETATION_PAGE = 'publish_interpretation'
const CHOSE_PAPER_PAGE = 'paper'
const ACCESS = ['zcx2021', 'lzw_super', 'admin', 'Caesar41']
const MANAGE = ['manage_paper', 'manage_interpretation', 'manage_user']

// const turnTo = (to, access, next) => {
//   if (canTurnTo(to.name, access, routes)) next() // 有权限，可访问
//   else next({ replace: true, name: 'error_401' }) // 无权限，重定向到401页面
// }

router.beforeEach((to, from, next) => {
  iView.LoadingBar.start()
  const token = getToken()
  if (!token && to.name !== LOGIN_PAGE_NAME) {
    // 未登录且要跳转的页面不是登录页
    next({
      name: LOGIN_PAGE_NAME // 跳转到登录页
    })
    // next()
  } else if (!token && to.name === LOGIN_PAGE_NAME) {
    // 未登陆且要跳转的页面是登录页
    next() // 跳转
  } else if (token && to.name === LOGIN_PAGE_NAME) {
    // 已登录且要跳转的页面是登录页
    next({
      name: homeName // 跳转到homeName页
    })
    // next()
  } else if (from.name !== CHOSE_PAPER_PAGE && token && to.name === WRITE_INTERPRETATION_PAGE) {
    if (!sessionStorage.getItem("paperId")) {
      Message.warning('您还没有选择一篇要解读的论文')
    } else {
      next()
    }
  } else if (from.name === CHOSE_PAPER_PAGE && token && to.name === WRITE_INTERPRETATION_PAGE) {
    store.commit('getPaperId', parseInt(from.params.id))
    next()
  } else if (MANAGE.includes(to.name)) {
    let acc = store.state.user.access
    if (ACCESS.includes(acc)) {
      next()
    } else {
      Message.warning("检测到风险行为，再次尝试将进行封号处理！！！")
      next({
        name: 'home'
      })
    }
  }
  else {
    next()
    // 暂时不做这个权限
    // if (store.state.user.hasGetInfo) {
    //   turnTo(to, store.state.user.access, next)
    // } else {
    //   store.dispatch('getUserInfo').then(user => {
    //     // 拉取用户信息，通过用户权限和跳转的页面的name来判断是否有权限访问;access必须是一个数组，如：['super_admin'] ['super_admin', 'admin']
    //     turnTo(to, user.access, next)
    //   }).catch(() => {
    //     setToken('')
    //     next({
    //       name: 'login'
    //     })
    //   })
    // }
  }
})

router.afterEach(to => {
  setTitle(to, router.app)
  iView.LoadingBar.finish()
  window.scrollTo(0, 0)
})

export default router
