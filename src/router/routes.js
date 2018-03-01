
export default [
  {
    path: '/',
    component: () => import('layouts/default'),
    children: [
      { path: '', component: () => import('pages/index') }
    ]
  },
  {
    path: '/test',
    component: () => import('layouts/test')
  },

  { // Always leave this as last one
    path: '*',
    component: () => import('pages/404')
  }
]
