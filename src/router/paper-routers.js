export const paperRoute = {
  path: '/paper',
  name: 'paper',
  component: () => import('@/view/paper/paper-info'),
  meta: {
    title: '论文相关'
  }
}
