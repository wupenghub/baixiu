$(function () {
    var reg = /^([a-zA-Z]|[0-9])(\w|\-)+@[a-zA-Z0-9]+\.([a-zA-Z]{2,4})$/;
    $('#registered').on('click', function () {
        // 本地验证登录信息
        //验证满足条件之后开始请求登录接口，获取登录接口
        $.ajax({
            type: 'post',
            url: '/baixiu/register',
            data: {email: $('#email').val(), password: $('#password').val()},
            dataType: "json",
            success: function (data) {
                if(data.register_status == 0){
                    alert('注册成功');
                    if(data.mailSend_status == 0){
                        alert('激活邮件已发送到注册邮箱，请前去激活');
                    }

                }
            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                alert("请求失败！");
            }

        });

    });
    $('#email').on('blur', function () {
        if (!reg.test($('#email').val())) {
            $('.tip').html('邮箱格式不正确').show();
            return;
        }
        $('.tip').hide();
        // 验证用户名是否存在
        utils.isExitUser($('.registered #email').val(), function (data) {
            if (data.user) {
                $('.tip').html('用户名系统已存在').show();
                $('.registered #registered').attr('disabled', true);
            } else {
                $('.registered #registered').attr('disabled', false);
            }
        });
    });
    $('#password').on('blur', function () {
        if (!$('#password').val()) {
            $('.tip').html('密码不能为空').show();
            $('.registered #registered').attr('disabled', true);
            return;
        }
        $('.registered #registered').attr('disabled', false);
        $('.tip').hide();
        // 验证用户名是否存在
        utils.isExitUser($('.registered #email').val(), function (data) {
            if (data.user) {
                $('.tip').html('用户名系统已存在').show();
                $('.registered #registered').attr('disabled', true);
            } else {
                $('.registered #registered').attr('disabled', false);
            }
        });
    });

});
