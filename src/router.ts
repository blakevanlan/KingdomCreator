import { createRouter, createWebHistory, createWebHashHistory } from "vue-router";

export function AppCreateRouter(paths: string[], component: any) {
  return createRouter({
    history: createWebHistory(),
    routes: paths.map(
      path => { return { 
                    path : path,
                    component : component } }
    )
  });
};

interface RouteConfig {
  paths: string[];
  component: any;
}

export function AppCreateRouterMultiple(routes: RouteConfig[]) {
  const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: routes.flatMap(route => route.paths.map(path => ({
      path,
      component: route.component
    })))
  });
  return router;
}