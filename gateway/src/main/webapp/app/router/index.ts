import { type RouteRecordRaw, createRouter as createVueRouter, createWebHistory } from 'vue-router';
import { importRemote } from '@module-federation/utilities';

const Home = () => import('@/core/home/home.vue');
const Error = () => import('@/core/error/error.vue');
import admin from '@/router/admin';
import entities from '@/router/entities';
import pages from '@/router/pages';

export const createRouter = () =>
  createVueRouter({
    history: createWebHistory(),
    routes: [
      {
        path: '/',
        name: 'Home',
        component: Home,
      },
      {
        path: '/forbidden',
        name: 'Forbidden',
        component: Error,
        meta: { error403: true },
      },
      {
        path: '/not-found',
        name: 'NotFound',
        component: Error,
        meta: { error404: true },
      },
      ...admin,
      entities,
      ...pages,
    ],
  });

const router = createRouter();

export const lazyRoutes = Promise.all([
  importRemote<any>({
    url: `./services/blog`,
    scope: 'blog',
    module: './entities-router',
  })
    .then(blogRouter => {
      router.addRoute(blogRouter.default as RouteRecordRaw);
      return blogRouter.default;
    })
    .catch(error => {
      console.log(`Error loading blog menus. Make sure it's up. ${error}`);
    }),
  importRemote<any>({
    url: `./services/store`,
    scope: 'store',
    module: './entities-router',
  })
    .then(storeRouter => {
      router.addRoute(storeRouter.default as RouteRecordRaw);
      return storeRouter.default;
    })
    .catch(error => {
      console.log(`Error loading store menus. Make sure it's up. ${error}`);
    }),
]);

router.beforeResolve(async (to, from, next) => {
  if (!to.matched.length) {
    await lazyRoutes;
    if (router.resolve(to.fullPath).matched.length > 0) {
      next({ path: to.fullPath });
      return;
    }

    next({ path: '/not-found' });
    return;
  }
  next();
});

export default router;
