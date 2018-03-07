

export default [
  {
    path: '/tmp',
    component: () => import('layouts/default')
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
    path: '/',
    component: () => import('components/dashboard'),
    meta: {
      requireAuth: true
    }
  },

  { // Always leave this as last one
    path: '*',
    component: () => import('pages/404')
  }
]
