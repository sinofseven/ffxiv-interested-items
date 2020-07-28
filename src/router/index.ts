import Vue from "vue";
import VueRouter, { RouteConfig } from "vue-router";
import Search from "@/views/Search.vue";
import Saved from "@/views/Saved.vue";
import Config from "@/views/Config.vue";
import About from "@/views/About.vue";

Vue.use(VueRouter);

const routes: Array<RouteConfig> = [
  {
    path: "/",
    redirect: "/search"
  },
  {
    path: "/search",
    component: Search
  },
  {
    path: "/saved",
    component: Saved
  },
  {
    path: "/config",
    component: Config
  },
  {
    path: "/about",
    component: About
  }
];

const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes
});

export default router;
