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
        console.log(123)
        $.ajax({
            type: 'get',
            url:'/baixiu/resetPwd',
            data: {email:$('.forget_pwd #email').val()},
            dataType: "json",
            success: function (data) {

            },
            error:function (XMLHttpRequest, textStatus, errorThrown) {

            }

        });

    });
    $('.forget_pwd #email').on('blur',function () {
        if(!reg.test($('.forget_pwd #email').val())){
            $('.tip').html('邮箱格式不正确').show();
            return;
        }else{
            $('.tip').hide();
        }
    })
});
