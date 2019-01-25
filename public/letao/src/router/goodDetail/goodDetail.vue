<template>
    <div class="good_detail">
        <!--首页轮播图模块-->
        <div class="mui-slider">
            <div class="mui-slider-group mui-slider-loop">
                <div class="mui-slider-item mui-slider-item-duplicate">
                    <img :src="detailBannerList[detailBannerList.length-1]">
                </div>
                <div v-for="detailBannerItem in detailBannerList" class="mui-slider-item">
                    <img :src="detailBannerItem">
                </div>
                <div class="mui-slider-item mui-slider-item-duplicate">
                    <img :src="detailBannerList[0]">
                </div>
            </div>
            <div class="mui-slider-indicator">
                <div class="mui-indicator mui-active"></div>
                <div class="mui-indicator"></div>
            </div>
        </div>
        <!--商品详情模块-->
        <div class="good_detail_info">
            <p class="good_detail_info_title">
                {{this.detailData.result&&this.detailData.result.product_desc}}
            </p>
        </div>
        <footer class="mui-clearfix">
            <div class="good_detail_left mui-clearfix">
                <a href="javascript:;">
                    <span class="fa fa-comment icon"></span>
                    <span class="content">联系客服</span>
                </a>
                <a href="javascript:;">
                    <span class="fa fa-group  icon"></span>
                    <span class="content">进店</span>
                </a>
                <a href="javascript:;">
                    <span class="fa fa-shopping-cart icon"></span>
                    <span class="content">购物车</span>
                </a>
            </div>
            <div class="good_detail_right mui-clearfix">
                <a href="javascript:;" class="add_cart">加入购物车</a>
                <a href="javascript:;" class="second_kill">立即秒杀</a>
            </div>
        </footer>
    </div>
</template>

<script>
    import mui from '../../lib/mui/js/mui.min';
    import utils from '../../utils.js';

    export default {
        data() {
            return {
                id:this.$route.params.id,
                detailData:{},
                detailBannerList:[]
            }
        },
        created(){
            this.$http.post(utils.serverName + '/letao/goodDetail',{id:this.id}).then(function (response) {
                this.detailData = response.body;
                this.detailBannerList = this.detailData.result.image_detail_url?this.detailData.result.image_detail_url.split(','):'http://localhost:5000/images/banner1.png';
            },function (error) {

            });
        },
        mounted(){
            mui('.good_detail .mui-slider').slider({
                interval: 1000//自动轮播周期，若为0则不自动播放，默认为0；
            });
        }
    }
</script>

<style scoped lang="scss">
    .good_detail {
        background-color: #fff;
        .mui-slider {
            height: 289px;
            width: 100%;
        }
        .good_detail_info{
            border-top: 1px solid #f3f3f3;
            .good_detail_info_title{
                padding: 10px;
                font-size: 16px;
                font-weight: 400;
                line-height: 18px;
            }
        }
        footer{
            background: #ffffff;
            width: 100%;
            position: fixed;
            left: 0;
            bottom: 0;
            height: 50px;
            .good_detail_left{
                float: left;
                width: 40%;
                a{
                    text-align: center;
                    display: block;
                    width: 33.33333%;
                    height: 50px;
                    float: left;
                    line-height: 50px;
                    color: #6d6d72;
                    font-size: 10px;
                    .icon{
                        display: block;
                        font-size: 18px;
                        margin-top: 8px;
                    }
                    .content{
                        margin-top: -13px;
                        display: block;
                        font-size: 10px;
                    }
                }

            }
            .good_detail_right{
                float: left;
                width: 60%;
                height: 50px;
                a{
                    width: 50%;
                    float: right;
                    display: inline-block;
                    text-align: center;
                    background: #E55225;
                    color: white;
                    padding: 0 20px;
                    line-height: 50px;
                    height: 50px;
                    font-size: 14px;
                    &.add_cart{
                        background: #ff9600;
                    }
                    &.second_kill{
                        background: #e4393c;
                    }
                }
            }
        }
    }
</style>