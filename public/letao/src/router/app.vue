<template>
    <div class="container">
        <header>
            <a class="mui-icon mui-icon-back" href="javascript:window.history.back();"></a>
            <span class="title">{{title}}</span>
        </header>
        <div class="content">
            <router-view @goDetail="goDetail"></router-view>
        </div>
        <footer v-show="!isDetail">
            <router-link to="/homePage" id="home-page">
                <span class="icon fa fa-home" id="home-page-icon"></span>
                <span class="home_page">首页</span>
            </router-link>
            <router-link to="/category" id="category-page">
                <span class="icon fa fa-bars" id="category-page-icon"></span>
                <span class="category_page">分类</span>
            </router-link>
            <router-link to="/cart" id="cart-page">
                <span class="icon fa fa-shopping-cart" id="cart-page-icon"></span>
                <span class="cart_page">购物车</span>
            </router-link>
            <router-link to="/member" id="member-page">
                <span class="icon fa fa-user-o" id="member-page-icon"></span>
                <span class="member_page">会员</span>
            </router-link>
        </footer>
    </div>
</template>

<script>
    export default {
        data() {
            return {
                title: '首页',
                isDetail: false,
                pathname: '/'
            };
        },
        watch: {
            "$route.path": function (newval) {
                console.log(newval)
                if (newval != '/homePage') {
                    document.getElementById("home-page").classList.remove("now");
                }
                if (newval.indexOf('/homePage') != -1) {
                    this.title = '首页';
                    this.isDetail = false;
                } else if (newval.indexOf('/category') != -1) {
                    this.title = '分类';
                    this.isDetail = false;
                } else if (newval.indexOf('/cart') != -1) {
                    this.title = '购物车';
                    this.isDetail = false;
                } else if (newval.indexOf('/member') != -1) {
                    this.title = '会员';
                    this.isDetail = false;
                } else if (newval.indexOf('/goodDetail') != -1) {
                    this.title = '商品详情';
                }
            }
        },
        beforeMount() {

        },
        mounted() {
            console.log(window.location.href);
        },
        methods: {
            goDetail(flag) {
                this.isDetail = flag;
            }
        }
    }
</script>
<style scoped lang="scss">
    .container {
        padding: 40px 0 45px 0;
        header {
            width: 100%;
            height: 40px;
            background-color: #39779C;
            position: fixed;
            text-align: center;
            top: 0;
            left: 0;
            a {
                position: absolute;
                display: inline-block;
                height: 40px;
                width: 40px;
                line-height: 40px;
                color: white;
                top: 0;
                left: 0;
            }
            .title {
                text-align: center;
                font-size: 14px;
                color: white;
                line-height: 40px;
            }
        }
        footer {
            height: 50px;
            width: 100%;
            background-color: #39779C;
            position: fixed;
            left: 0;
            bottom: 0;
            a {
                cursor: pointer;
                padding: 5px 0;
                color: #eeeeee;
                display: inline-block;
                width: 25%;
                text-align: center;
                font-size: 14px;
                float: left;
                height: 100%;
                .icon {
                    display: block;
                    font-size: 16px;
                    margin-bottom: 2px;
                }
                &.now {
                    color: orange;
                }
            }
        }
    ;
        .content {
            display: block;
            width: 100%;
        }
    }
</style>