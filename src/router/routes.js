

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
  {
    path: '/project_type',
    component: () => import('components/chooseType'),
    meta: {
      requireAuth: true
    }
  },
  {
    path: '/project',
    component: () => import('components/project'),
    meta: {
      requireAuth: true
    }
  },
  {
    path: '/user',
    component: () => import('components/user'),
    meta: {
      requireAuth: true
    }
  },
  {
    path: '/userEnergy',
    component: () => import('components/userEnergy'),
    meta: {
      requireAuth: true
    }
  },
  {
    path: '/admin',
    component: () => import('components/admin/admin'),
    meta: {
      requireAuth: true
    }
  },

  { // Always leave this as last one
    path: '*',
    component: () => import('pages/404')
  }
]
