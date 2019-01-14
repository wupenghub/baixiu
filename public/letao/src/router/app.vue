<template>
    <div class="container">
        <header>
            <a class="mui-icon mui-icon-back"  href="javascript:window.history.back();"></a>
            <span class="title">首页</span>
        </header>
    </div>
</template>

<script>
    export default {
        data(){
            return {};
        }/*,
        methods:{

        },
        created:{

        }*/
    }
</script>

<style scoped lang="scss">
    .container{
        header{
            width: 100%;
            height: 40px;
            background-color: #39779C;
            a{
                display: inline-block;
                height: 40px;
                width: 50px;
                line-height: 40px;
                color: white;
            }
            .title{
                display: inline-block;
                text-align: center;
                font-size: 14px;
                color: white;
            }
        }
    }
</style>