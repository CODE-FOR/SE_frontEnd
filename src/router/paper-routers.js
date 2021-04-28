export const paperRoute = {
  path: '/paper/:id',
  name: 'paper',
  component: () => import('@/view/paper/paper-info'),
  meta: {
    title: '论文相关',
    hideInMenu: true
  }
}

export const paperInterpretation = {
  path: '/paper/:id/interpretation',
  name: 'interpretation',
  component: () => import('@/view/interpretation/interpretation-list'),
  meta: {
    title: '论文解读',
    icon: 'ios-person'
  }
}
