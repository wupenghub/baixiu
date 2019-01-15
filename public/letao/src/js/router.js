import VueRouter from 'vue-router';

import homePage from '../router/homePage/homePage.vue';
import category from '../router/category/category.vue';
import cart from '../router/cart/cart.vue';
import member from '../router/member/member.vue';

var vueRouter = new VueRouter({
    routes:[
        {path:"/",redirect:"/homePage"},
        {
            path:'/homePage',
            component:homePage
        },
        {
            path:'/category',
            component:category
        },
        {
            path:'/cart',
            component:cart
        },
        {
            path:'/member',
            component:member
        },
    ],
    linkActiveClass:'now'
});
export default vueRouter;