import Vue from 'vue'

import App from './biz/custom2048/index.vue'

import './global/base.less'

Vue.config.productionTip = false

// console.log(App)
/* eslint-disable no-new */
new Vue({
  el: '#app',
  render: h => h(App)
})
