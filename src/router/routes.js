

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
      requireAuth: true,
      title: '周报系统'
    }
  },
  {
    path: '/console',
    component: () => import('components/console'),
    meta: {
      requireAuth: true,
      title: 'TT控制台'
    }
  },
  {
    path: '/project',
    component: () => import('components/project'),
    meta: {
      requireAuth: true,
      title: '周报项目'
    }
  },
  {
    path: '/user',
    component: () => import('components/user'),
    meta: {
      requireAuth: true,
      title: '用户'
    }
  },
  {
    path: '/userEnergy',
    component: () => import('components/userEnergy'),
    meta: {
      requireAuth: true,
      title: '用户能量图'
    }
  },
  {
    path: '/pm',
    component: () => import('layouts/pm/pm'),
    meta: {
      requireAuth: true,
      title: 'PM周报系统'
    }
  },
  {
    path: '/userShow',
    component: () => import('layouts/user/userShow'),
    meta: {
      requireAuth: true,
      title: '成员秀'
    }
  },
  {
    path: '/admin',
    component: () => import('components/admin/admin'),
    meta: {
      requireAuth: true,
      title: '超管控制台'
    }
  },

  { // Always leave this as last one
    path: '*',
    component: () => import('pages/404')
  }
]
