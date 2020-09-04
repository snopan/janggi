import Vue from "vue"
import { store } from "./store/store.js"
import { BootstrapVue, BootstrapVueIcons } from 'bootstrap-vue'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'
import App from "./App.vue"

Vue.config.productionTip = false

// Install BootstrapVue
Vue.use(BootstrapVue)

// Install Bootstrap Icons
Vue.use(BootstrapVueIcons)

// Add a custom directive for clicking outside
// ref: https://stackoverflow.com/questions/36170425
Vue.directive('click-outside', {
  bind: function (el, binding, vnode) {
    el.clickOutsideEvent = function (event) {
      // here I check that click was outside the el and his childrens
      if (!(el == event.target || el.contains(event.target))) {
        // and if it did, call method provided in attribute value
        vnode.context[binding.expression](event);
      }
    };
    document.body.addEventListener('click', el.clickOutsideEvent)
  },
  unbind: function (el) {
    document.body.removeEventListener('click', el.clickOutsideEvent)
  },
});

new Vue({
  render: h => h(App),
  store,
}).$mount('#app')