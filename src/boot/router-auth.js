export default ({ store, router }) => {
  router.beforeEach((to, from, next) => {
    switch (to.path) {
      case '/login':
        if (!to.query.redirect) {
          if (!from.query.redirect) {
            next({
              path: '/login',
              query: { redirect: from.fullPath },
            });
          } else {
            next({
              path: '/login',
              query: { redirect: from.query.redirect },
            });
          }
        } else {
          next();
        }
        break;

      case '/register':
        if (!to.query.redirect) {
          if (!from.query.redirect) {
            next({
              path: '/register',
              query: { redirect: from.fullPath },
            });
          } else {
            next({
              path: '/register',
              query: { redirect: from.query.redirect },
            });
          }
        } else {
          next();
        }
        break;

      default:
        if (to.meta.requiresAuth && !store.getters.getIsLoggedIn) {
          next({
            path: '/login',
            query: { redirect: to.fullPath },
          });
        } else {
          next();
        }
    }
  });
};
