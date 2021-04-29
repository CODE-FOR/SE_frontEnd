export const interpretationRoute = {
  path: '/interpretation/:id',
  name: 'interpretation',
  component: () => import('@/view/interpretation/interpretation-info'),
  meta: {
    title: '论文解读相关'
  }
}