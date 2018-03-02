

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
  {
    path: '/login',
    component: () => import('components/login')
  },
  {
    path: '/dashboard',
    component: () => import('components/dashboard')
  },

  { // Always leave this as last one
    path: '*',
    component: () => import('pages/404')
  }
]
