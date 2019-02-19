import Vue from 'vue';
import appVue from '../router/app.vue';
import VueRouter from 'vue-router';
import vueRouter from './router.js';
// 引入mui插件
import '../lib/mui/css/mui.min.css';
import '../lib/mui/js/mui.js';
//引入fontAwesome插件
import '../lib/fontAwesome/css/font-awesome.min.css';
//引入vueResource进行ajax请求
import VueResource from 'vue-resource'
// 2.2 安装 vue-resource
Vue.use(VueResource);
Vue.use(VueRouter);
var vue = new Vue({
    el: "#app",
    render: letao => letao(appVue),
    router: vueRouter
});