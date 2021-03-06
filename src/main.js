import Vue from 'vue';
import VueRouter from 'vue-router';
import {routes} from './routes';
import App from './App.vue';
import store from './store';


Vue.use(VueRouter);

const router = new VueRouter({
  mode: 'history',
  scrollBehavior (to, from, savedPosition) {
    return { x: 0, y: 0 }
  },
  routes
});

new Vue({
  el: '#app',
  router,
  store,
  render: h => h(App)
});

axios.defaults.baseURL   = 'http://api.pm0603.com';
