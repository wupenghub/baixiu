<template>
    <div class="container">
        <header>
            <a class="mui-icon mui-icon-back"  href="javascript:window.history.back();">

            </a>
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
                height: 100%;
                width: 50px;
            }
        }
    }
</style>