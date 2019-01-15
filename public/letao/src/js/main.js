import Vue from 'vue';
import appVue from '../router/app';
import VueRouter from 'vue-router';
import vueRouter from './router.js';
// 引入mui插件
import '../lib/mui/css/mui.min.css';
import '../lib/mui/fonts/mui.ttf';
import '../lib/mui/js/mui.js';
//引入fontAwesome插件
import '../lib/fontAwesome/css/font-awesome.min.css';
Vue.use(VueRouter);
var vue = new Vue({
    el: "#app",
    render: function (createElement) {
        return createElement(appVue);
    },
    router: vueRouter
});