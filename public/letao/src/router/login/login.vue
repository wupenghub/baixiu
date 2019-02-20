<template>
    <div class="login">
        <input type="text" v-model="email" class="user_name" placeholder="请输入用户名"/>
        <input type="password" v-model="password" class="pass_word" placeholder="请输入密码"/>
        <input type="button" class="login_in" value="登录" @click="login()"/>
        <load :showLoading="showLoading"></load>
    </div>
</template>

<script>
    import mui from '../../lib/mui/js/mui.min';
    import utils from '../../utils.js';
    export default {
       data(){
           return {
               email:'',
               password:'',
               showLoading:false
           }
       },
        created(){
            this.$emit('goDetail',false);
        },
        methods:{
            login(){
                this.showLoading = true;
                this.$http.post(utils.serverName + '/leTao/login',  {userName: this.email,password:this.password}).then(function (response) {
                    var data = response.body;
                    if(data.status == 1){
                        mui.toast('登录失败',{ duration:'long', type:'div' });
                    }else if(data.status == 0){
                        mui.toast('登录成功',{ duration:'long', type:'div' });
                        utils.userName = data.loginUser.email;
                        this.$router.push({
                            path: '/goodDetail/'+this.$route.params.id
                        })
                    }
                    this.showLoading = false;
                }, function (error) {
                    this.showLoading = false;
                });
            }
        },


    }
</script>

<style scoped lang="scss">
    .login{
        position: relative;
        padding: 10px;
        margin-top: 10px;
        .user_name{
            width: 100%;
        }
        .pass_word{
            width: 100%;
        }
        .login_in{
            width: 100%;
            background: #39779C;
            border-color: #39779C;
            color: white;
        }
    }
</style>