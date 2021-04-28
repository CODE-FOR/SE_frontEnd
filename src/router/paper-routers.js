export const paperRoute = {
  path: '/paper/:id',
  name: 'paper',
  component: () => import('@/view/paper/paper-info'),
  meta: {
    title: '论文相关',
    hideInMenu: true
  }
}
