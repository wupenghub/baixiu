$(function () {
    var reg = /^([a-zA-Z]|[0-9])(\w|\-)+@[a-zA-Z0-9]+\.([a-zA-Z]{2,4})$/;
    $('.forget_pwd #find-pwd').unbind();
    $('.forget_pwd #find-pwd').on('click',function () {
        $.ajax({
            type: 'get',
            url:'/baixiu/resetPwd',
            data: {email:$('.forget_pwd #email').val()},
            dataType: 'json',
            success: function (data) {
                if(data.status == 0){
                    alert('邮件发送成功，请在邮件中进行密码修改。');
                    return;
                }
                alert('邮件发送失败，请重新发送。');
            },
            error:function (XMLHttpRequest, textStatus, errorThrown) {
                alert('邮件发送失败，请重新发送。');
            }

        });
        return false;
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
