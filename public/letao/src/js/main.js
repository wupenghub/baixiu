import Vue from 'vue';
import appVue from '../router/app';
// 引入mui插件
import '../lib/mui/css/mui.min.css';
import '../lib/mui/fonts/mui.ttf';
import '../lib/mui/js/mui.js';
import vueRouter from './router';
var vue = new Vue({
    el: "#app",
    render: function (createElement) {
        return createElement(appVue);
    },
    router: vueRouter,
});