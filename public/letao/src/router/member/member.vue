<template>
    <div class="member">
        <div class="content">
            <div class="no-login">
                <input type="text" name="" id="user-name" placeholder="用户名/手机号">
                <div class="pwd">
                    <input :type="isactive?'text':'password'" name="" id="user-pwd" placeholder="密码">
                    <span class="pwd_logo fa fa-eye" :class="['pwd_logo','fa fa-eye',isactive?'now':'']" @click="checkPwd()"></span>
                </div>
                <button type="button" id="login" class="mui-btn mui-btn-primary">登录</button>
                <a href="regiester" id="regiester">免费注册</a>
            </div>
            <div class="logined">
                <div class="user_info">
                    <img src="../../images/user.jpg" class="user_image" alt="">
                    <div class="user_info_phone">
                        <p class="user_name">吴鹏</p>
                        <span class="phone_num">绑定手机号：11111111111</span>
                    </div>
                </div>
                <div class="accout_safe">
                    <div class="left"><span>账户与安全</span></div>
                    <div class="right">
                        <span class="fa fa-angle-right"></span>
                    </div>
                </div>
                <div class="my_cart">
                    <div class="left"><span>我的购物车</span></div>
                    <div class="right">
                        <span class="fa fa-angle-right"></span>
                    </div>
                </div>
                <div class="address">
                    <div class="left"><span>收货地址管理</span></div>
                    <div class="right">
                        <span class="fa fa-angle-right"></span>
                    </div>
                </div>
            </div>
        </div>
        <div class="btn">
            <button type="button" class="mui-btn mui-btn-block">退出登录</button>
        </div>
    </div>
</template>

<script>
    export default {
       data(){
           return {
               isactive : false,
           }
       },
        methods:{
            checkPwd(){
                this.isactive = !this.isactive;
            }
        },
        components:{

        }
    }
</script>

<style scoped lang="scss">
    .member{
        height: 100%;
        .content {
            background: #ffffff;
            padding: 0 10px 0 10px;
            .no-login {
                display: none;
                #user-name {
                    width: 100%;
                }
                .pwd {
                    position: relative;
                    #user-pwd {
                        width: 100%;
                    }
                    .pwd_logo {
                        position: absolute;
                        top: 10px;
                        right: 0px;
                        color: #6d6d72;
                        font-size: 16px;
                    }
                    .pwd_logo.now {
                        color: #39779C;
                    }
                }
                #login {
                    width: 100%;
                    margin-top: 20px;
                    background: #39779C;
                    border: none;
                }
                #regiester {
                    float: right;
                    font-size: 12px;
                    margin-top: 8px;
                    text-decoration: underline;
                }
            };
            .logined {
                .user_info {
                    position: relative;
                    padding: 10px;
                    border-bottom: 2px solid #f3f3f3;
                    .user_image {
                        width: 30px;
                        height: 30px;
                        position: absolute;
                        top: 50%;
                        left: 5px;
                        margin-top: -15px;
                    }
                    .user_info_phone {
                        padding-left: 35px;
                        display: inline-block;
                        .user_name {
                            margin-bottom: 0;
                        }
                        .phone_num {
                            font-size: 12px;
                        }
                    }
                }
                .accout_safe {
                    border-bottom: 2px solid #f3f3f3;
                    padding: 0 8px;
                    font-size: 16px;
                    height: 50px;
                    line-height: 50px;
                }
                .my_cart {
                    border-bottom: 2px solid #f3f3f3;
                    padding: 0 8px;
                    font-size: 16px;
                    height: 50px;
                    line-height: 50px;
                }
                .address {
                    padding: 0 8px;
                    font-size: 16px;
                    height: 50px;
                    line-height: 50px;
                }
            }
            .left {
                float: left;
            }
            .right {
                float: right;
            }
        }
        button{
            width: 100%;
        }
        .btn{
            padding: 30px;
            button{
                padding: 5px 0;
            }
        }
    }
</style>