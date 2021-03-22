
const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        component: () => import('pages/Home.vue'),
      },
      {
        path: '/page2',
        component: () => import('pages/Page2.vue'),
      },
      {
        path: '/protected',
        component: () => import('pages/Protected.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: '/login',
        component: () => import('pages/Login.vue'),
      },
      {
        path: '/register',
        component: () => import('pages/Register.vue'),
      },
      {
        path: '/credentials',
        component: () => import('pages/UserEmailPassword.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: '/deleteAccount',
        component: () => import('pages/DeleteAccount.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: '/profileDetail/:tab?',
        component: () => import('pages/ProfileDetailMain.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: '/profilePersonalData',
        component: () => import('pages/ProfilePersonalData.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: '/profilePicture',
        component: () => import('pages/ProfilePicture.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: '/profileImages',
        component: () => import('pages/Images.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: '/payments',
        component: () => import('pages/Payments.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: '/transactions',
        component: () => import('pages/Transactions.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: '/contact',
        component: () => import('pages/Contact.vue'),
      },
      {
        path: '/chat',
        component: () => import('pages/Chat.vue'),
        meta: { requiresAuth: true },
      },
    ],
  },
];

// Always leave this as last one
routes.push({
  path: '*',
  component: () => import('pages/Error404.vue'),
});

export default routes;
