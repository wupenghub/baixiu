$(function () {
    var reg = /^([a-zA-Z]|[0-9])(\w|\-)+@[a-zA-Z0-9]+\.([a-zA-Z]{2,4})$/;
    $('#login').on('click',function () {
        // 本地验证登录信息
        if(!$('#email').val()){
            $('.tip').html('用户名不能为空').show();
            return;
        }
        if(!$('#password').val()){
            $('.tip').html('密码不能为空').show();
            return;
        }
        if(!reg.test($('#email').val())){
            $('.tip').html('邮箱格式不正确').show();
            return;
        }
        $('.tip').hide();
        //验证满足条件之后开始请求登录接口，获取登录接口
        $.ajax({
            type: 'post',
            url: '/baixiu/login',
            data: {email:$('#email').val(),password:$('#password').val()},
            dataType: "json",
            success: function (data) {
                if(data.login_state == 0) {
                    window.location.href = '/';
                }else{
                    alert(data.login_desc);
                }
            },
            error:function (XMLHttpRequest, textStatus, errorThrown) {
                alert("请求失败！");
            }

        });

    });
    $('#email').on('blur',function () {
        if(!reg.test($('#email').val())){
            $('.tip').html('邮箱格式不正确').show();
            return;
        }
        $('.tip').hide();
        // 验证用户名是否存在
        utils.isExitUser($('.login #email').val(),function (data) {
            if(data.user) {
                $('.login .avatar').attr('src', data.user.avatar);
                $('.tip').hide();
                $('.login #login').attr('disabled',false);
            }else{
                $('.login .avatar').attr('src', '/public/img/default.png');
                $('.tip').html('用户名系统不存在').show();
                $('.login #login').attr('disabled',true);
            }
        });
    });

})
