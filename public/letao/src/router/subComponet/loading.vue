<template>
    <div class="container" v-show="showLoading">
        <i ref="loading_icon" class="fa fa-hourglass-2"></i>
    </div>
</template>

<script>
    export default {
        data(){
            return{
                clientHeight:0,
            }
        },
       created(){
       },
        mounted(){
            //获取可见屏幕的高度
           this.clientHeight = document.body.clientHeight;
            var loadView = this.$refs.loading_icon;
            var loadHeight = loadView.offsetHeight;
            var marginTop = (this.clientHeight - loadHeight)/2
            loadView.style.marginTop = marginTop+'px';
        },
        props:['showLoading']
    }
</script>

<style scoped lang="scss">
    .container{
        height: 100%;
        width: 100%;
        background: rgba(0, 0, 0, .7);
        z-index: 200;
        position: absolute;
        left: 0;
        bottom: 0;
        i{
            display: block;
            text-align: center;
            color: #ffffff;
            animation: rotate 5s;
            -webkit-animation: rotate 1s linear infinite;
        }
        @keyframes rotate{
            from{
                -webkit-transform:rotateZ(0deg);
            }
            to{
                -webkit-transform:rotateZ(360deg);
            }
           /* 0%   {color: red;}
            25%  {color: yellow;}
            50%  {color: white;}
            100% {color: green;}*/
        }
    }
</style>