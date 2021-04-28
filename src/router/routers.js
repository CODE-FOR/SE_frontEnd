import Main from '@/components/main'
import UserRoute from './user-routers'
import {paperRoute, paperInterpretation} from './paper-routers'
// import parentView from '@/components/parent-view'

/**
 * iview-admin中meta除了原生参数外可配置的参数:
 * meta: {
 *  title: { String|Number|Function }
 *         显示在侧边栏、面包屑和标签栏的文字
 *         使用'{{ 多语言字段 }}'形式结合多语言使用，例子看多语言的路由配置;
 *         可以传入一个回调函数，参数是当前路由对象，例子看动态路由和带参路由
 *  hideInBread: (false) 设为true后此级路由将不会出现在面包屑中，示例看QQ群路由配置
 *  hideInMenu: (false) 设为true后在左侧菜单不会显示该页面选项
 *  notCache: (false) 设为true后页面在切换标签后不会缓存，如果需要缓存，无需设置这个字段，而且需要设置页面组件name属性和路由配置的name一致
 *  access: (null) 可访问该页面的权限数组，当前路由设置的权限会影响子路由
 *  icon: (-) 该页面在左侧菜单、面包屑和标签导航处显示的图标，如果是自定义图标，需要在图标名称前加下划线'_'
 *  beforeCloseName: (-) 设置该字段，则在关闭当前tab页时会去'@/router/before-close.js'里寻找该字段名对应的方法，作为关闭前的钩子函数
 * }
 */

export default [
  {
    path: '/login',
    name: 'login',
    meta: {
      title: 'Login - 登录',
      hideInMenu: true
    },
    component: () => import('@/view/login/login.vue')
  },
  {
    path: '/',
    name: '_home',
    redirect: '/home',
    component: Main,
    meta: {
      hideInMenu: true,
      notCache: true
    },
    children: [
      {
        path: '/home',
        name: 'home',
        meta: {
          hideInMenu: true,
          title: '首页',
          notCache: true,
          icon: 'md-home'
        },
        component: () => import('@/view/home')
      },
      paperRoute,
      paperInterpretation,
      // {
      //   path: '/paper/:id',
      //   name: 'paper',
      //   component: () => import('@/view/paper/paper-info'),
      //   meta: {
      //     title: '论文相关',
      //     hideInMenu: true
      //   }
      // },
      // {
      //   path: '/paper/:id/interpretation',
      //   name: 'interpretation',
      //   component: () => import('@/view/interpretation/interpretation-list'),
      //   meta: {
      //     title: '论文解读',
      //     icon: 'ios-person'
      //   }
      // },
      {
        path: 'search/:query',
        name: 'search',
        meta: {
          hideInMenu: true,
          title: '检索',
          notCache: true,
          icon: 'md-search'
        },
        component: () => import('@/view/home/search')
      }
    ]
  },
  {
    path: '/message',
    name: 'message',
    component: Main,
    meta: {
      hideInBread: true,
      hideInMenu: true
    },
    children: [
      {
        path: 'message_page',
        name: 'message_page',
        meta: {
          icon: 'md-notifications',
          title: '消息中心'
        },
        component: () => import('@/view/message/index.vue')
      }
    ]
  },
  {
    path: '/publish',
    name: 'publish',
    meta: {
      icon: 'logo-buffer',
      title: '发布'
    },
    component: Main,
    children: [
      {
        path: 'paper',
        name: 'publish_paper',
        meta: {
          icon: 'logo-markdown',
          // title: '发布微证据'
          title: '发布论文'
        },
        component: () => import('@/view/micro-knowledge/paper-form.vue')
      },
      {
        path: 'publish_interpretation',
        name: 'publish_interpretation',
        meta: {
          icon: 'ios-create',
          title: '发布论文解读'
        },
        component: () => import('@/view/micro-knowledge/interpretation-form.vue')
      },
      {
        path: 'create_project',
        name: 'create_project',
        meta: {
          icon: 'ios-pricetag',
          title: '发布赞助项目'
        },
        component: () => import('@/view/sponsor-project/project-form.vue')
      }
    ]
  },
  {
    path: '/verify',
    name: 'verify',
    meta: {
      hideInBread: true
    },
    component: Main,
    children: [{
      path: 'verify_knowledge',
      name: 'verify_knowledge',
      meta: {
        icon: 'md-book',
        title: '审核'
      },
      component: () => import('@/view/micro-knowledge/knowledge-verify.vue')
    }]
  },
  {
    path: '/sponsor_project', // 这个路径到时候写的时候再改吧
    name: 'sponsor_project',
    meta: {
      hideInBread: true
    },
    component: Main,
    children: [
      {
        path: 'all_projects',
        name: 'all_projects',
        meta: {
          icon: 'md-planet',
          title: '赞助商信息'
        },
        component: () => import('@/view/sponsor-project/sponsor-project-all.vue')
      }, {
        path: 'home/:project_id',
        name: 'project_home',
        meta: {
          icon: 'md-planet',
          title: '项目',
          hideInMenu: true
        },
        component: () => import('@/view/sponsor-project/sponsor-project-home.vue')
      }
    ]
  },
  UserRoute,
  {
    path: '/401',
    name: 'error_401',
    meta: {
      hideInMenu: true
    },
    component: () => import('@/view/error-page/401.vue')
  },
  {
    path: '/500',
    name: 'error_500',
    meta: {
      hideInMenu: true
    },
    component: () => import('@/view/error-page/500.vue')
  },
  {
    path: '*',
    name: 'error_404',
    meta: {
      hideInMenu: true
    },
    component: () => import('@/view/error-page/404.vue')
  }
]
