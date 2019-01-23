<template>
    <div class="home_page">
        <!--首页轮播图部分-->
        <div class="mui-slider">
            <div class="mui-slider-group mui-slider-loop">
                <div class="mui-slider-item mui-slider-item-duplicate">
                    <img :src="bannerList[bannerList.length-1]">
                </div>
                <div v-for="bannerItem in bannerList" class="mui-slider-item">
                    <img :src="bannerItem.productImageUrl">
                </div>
                <div class="mui-slider-item mui-slider-item-duplicate">
                    <img :src="bannerList[0]">
                </div>
            </div>
            <div class="mui-slider-indicator">
                <div class="mui-indicator mui-active"></div>
                <div class="mui-indicator"></div>
                <div class="mui-indicator"></div>
                <div class="mui-indicator"></div>
            </div>
        </div>
        <!--产品推荐部分-->
        <div class="recommended">
            <ul class="recommended_product_list mui-clearfix">
                <li><a href="javascript:;"><img src="../../images/nav1.png"></a></li>
                <li><a href="javascript:;"><img src="../../images/nav2.png"></a></li>
                <li><a href="javascript:;"><img src="../../images/nav3.png"></a></li>
                <li><a href="javascript:;"><img src="../../images/nav4.png"></a></li>
                <li><a href="javascript:;"><img src="../../images/nav5.png"></a></li>
                <li><a href="javascript:;"><img src="../../images/nav6.png"></a></li>
            </ul>
        </div>
        <!--产品列表界面-->
        <div class="product_list">
            <ul class="mui-clearfix">
                <li v-for="item in productList">
                    <a href="javascript:;">
                        <img :src="item.productImageUrl"/>
                        <p>{{item.productDesc}}</p>
                        <p>
                            <span class="now_price">
                                ￥{{item.productPrice}}
                            </span>
                            <span class="old_price">
                                ￥{{item.productPreferentialPrice}}
                            </span>
                        </p>
                        <button type="button" class="mui-btn mui-btn-primary" @click="goDetail()">立即购买</button>
                    </a>
                </li>
            </ul>
        </div>
    </div>
</template>

<script>
    import mui from '../../lib/mui/js/mui.min';
    import utils from '../../utils.js';

    export default {
        data() {
            return {
                bannerList: [],
                productList: [],
            };
        },
        created() {
            //发送ajax请求获取首页数据
            this.$http.get(utils.serverName + '/letao/homePage', {}).then(function (response) {
                if (response.body.banner) {
                    if (response.body.banner.banner_list && response.body.banner.banner_list.length > 0) {
                        this.bannerList = response.body.banner.banner_list;
                    }
                    if (response.body.productList.product_list && response.body.productList.product_list.length > 0) {
                        this.productList = response.body.productList.product_list;
                    }
                }
            }, function (response) {

            });
        },
        mounted() {
            mui('.mui-slider').slider({
                interval: 1000//自动轮播周期，若为0则不自动播放，默认为0；
            });
        },
        methods:{
            goDetail(id){
                this.$router.push({name:'goodDetail',params:{id}});
            }
        }
    }
</script>

<style scoped lang="scss">
    .home_page {
        background-color: #fff;
        .mui-slider {
            height: 256px;
            width: 100%;
            .mui-slider-item {
                img {

                }
            }
        }
        .recommended {
            padding: 5px;
            .recommended_product_list {
                list-style: none;
                li {
                    float: left;
                    width: 33.333%;
                    height: 122px;
                    a {
                        width: 100%;
                        height: 100%;
                        display: inline-block;
                        img {
                            width: 100%;
                            height: 100%;
                            text-align: center;
                            display: inline-block;
                        }
                    }
                }
            }
        }
        .product_list {
            padding: 5px;
            ul {
                list-style: none;
                li {
                    box-shadow: 2px 2px #f3f3f3;
                    border: 1px solid #f3f3f3;
                    width: 48%;
                    text-align: center;
                    padding: 5px 0;
                    a {
                        display: block;
                        img {
                            display: block;
                            width: 187px;
                            height: 187px;
                        }
                        p {
                            .now_price {
                                color: red;
                            }
                            .old_price {
                                font-size: 12px;
                                text-decoration: line-through;
                            }
                        }
                        button {
                            background: #006699;
                        }
                    }
                }
            ;
                li:nth-child(2n) {
                    float: right;
                }
            ;
                li:nth-child(2n+1) {
                    float: left;
                }
            }
        }
    }
</style>