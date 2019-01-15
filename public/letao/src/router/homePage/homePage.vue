<template>
    <div class="home_page">
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
    }
</style>