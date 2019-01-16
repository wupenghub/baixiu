<template>
    <div class="home_page">
        <!--首页轮播图部分-->
        <div class="mui-slider">
            <div class="mui-slider-group mui-slider-loop">
                <div class="mui-slider-item mui-slider-item-duplicate">
                    <img src="../../images/banner4.png">
                </div>
                <div class="mui-slider-item">
                    <!-- 具体内容 -->
                    <img src="../../images/banner1.png">
                </div>
                <div class="mui-slider-item">
                    <img src="../../images/banner2.png">
                </div>
                <div class="mui-slider-item">
                    <!-- 具体内容 -->
                    <img src="../../images/banner3.png">
                </div>
                <div class="mui-slider-item">
                    <img src="../../images/banner4.png">
                </div>
                <div class="mui-slider-item mui-slider-item-duplicate">
                    <!-- 具体内容 -->
                    <img src="../../images/banner1.png">
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
            <ul class="product_list">
                <li><a href="javascript:;"><img src="../../images/nav1.png"></a></li>
                <li><a href="javascript:;"><img src="../../images/nav2.png"></a></li>
                <li><a href="javascript:;"><img src="../../images/nav3.png"></a></li>
                <li><a href="javascript:;"><img src="../../images/nav4.png"></a></li>
                <li><a href="javascript:;"><img src="../../images/nav5.png"></a></li>
                <li><a href="javascript:;"><img src="../../images/nav6.png"></a></li>
            </ul>
        </div>
        <div style="height: 200px"></div>
    </div>

</template>

<script>
    import mui from '../../lib/mui/js/mui.min';
    mui('.mui-slider').slider({
        interval:1000//自动轮播周期，若为0则不自动播放，默认为0；
    });
    export default {
        data(){
            return {};
        },
        created(){
            mui('.mui-slider').slider({
                interval:1000//自动轮播周期，若为0则不自动播放，默认为0；
            });
        }
    }
</script>

<style scoped lang="scss">
    .home_page{
        .mui-slider{
            height: 256px;
            width: 100%;
            .mui-slider-item{
                img{

                }
            }
        }
        .recommended{
            padding: 8px;
            .product_list{
                list-style: none;
                li{
                    float: left;
                    width: 33.333%;
                    height: 122px;
                    a{
                        width: 100%;
                        height: 100%;
                        display: inline-block;
                        img{
                            width: 100%;
                            height: 100%;
                            text-align: center;
                            display: inline-block;
                            /*background: url("../../images/nav1.png") center no-repeat;*/
                        }
                    }
                }
            }
        }
    }
</style>