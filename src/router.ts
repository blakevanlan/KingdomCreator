import { createRouter, createWebHistory } from "vue-router";

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
    history: createWebHistory(),
    routes: routes.flatMap(route => route.paths.map(path => ({
      path,
      component: route.component
    })))
  });
  return router;
}