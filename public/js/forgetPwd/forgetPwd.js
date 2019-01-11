$(function () {
    var reg = /^([a-zA-Z]|[0-9])(\w|\-)+@[a-zA-Z0-9]+\.([a-zA-Z]{2,4})$/;
    $('#find-pwd').unbind();
    $('#find-pwd').on('click',function () {
        // 本地验证登录信息
        if(!$('.forget_pwd #email').val()){
            $('.tip').html('用户名不能为空').show();
            return;
        }

        if(!reg.test($('.forget_pwd #email').val())){
            $('.tip').html('邮箱格式不正确').show();
            return;
        }
        $('.tip').hide();
        //验证满足条件之后开始请求登录接口，获取登录接口
        $.ajax({
            type: 'get',
            url:'/baixiu/resetPwd',
            data: {email:$('.forget_pwd #email').val()},
            dataType: "json",
            success: function (data) {
                if(data.status == 0){
                    alert('邮件发送成功，请在邮件中进行密码修改。');
                    return;
                }
                alert('邮件发送失败，请重新发送。');
            },
            error:function (XMLHttpRequest, textStatus, errorThrown) {

            }

        });

    });
    $('.forget_pwd #email').on('blur',function () {
        if(!reg.test($('.forget_pwd #email').val())){
            $('.tip').html('邮箱格式不正确').show();
            return;
        }
        $('.tip').hide();
        // 验证用户名是否存在
       utils.isExitUser($('.forget_pwd #email').val(),function (data) {
           if(data.user) {
               $('.forget_pwd .avatar').attr('src', data.user.avatar);
               $('.tip').hide();
               $('#find-pwd').attr('disabled',false);
           }else{
               $('.forget_pwd .avatar').attr('src','/public/img/default.png');
               $('.tip').html('用户名系统不存在').show();
               $('#find-pwd').attr('disabled',true);
           }
       });
    });
});
