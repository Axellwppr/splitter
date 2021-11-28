import Vue from 'vue'
import App from './App.vue'
// import vuetify from 'vuetify'

Vue.config.productionTip = false

new Vue({
    vuetify: new Vuetify(),
    render: function(h) { return h(App) }
}).$mount('#app')