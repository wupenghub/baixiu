$(function () {
    $('.reset_pwd #conform-modify').removeAttr('href');
    $('.reset_pwd #pwd').on('blur',function () {
        if(!$('.reset_pwd #pwd').val() || !$('.reset_pwd #conform-pwd').val()){
            $('.reset_pwd .tip').show();
            $('.reset_pwd .tip').html('请填写完必填信息');
            $('.reset_pwd #conform-modify').attr('disabled',true);
            return;
        }
        if($('.reset_pwd #pwd').val() != $('.reset_pwd #conform-pwd').val()){
            $('.reset_pwd .tip').show();
            $('.reset_pwd .tip').html('两次密码输入不一致');
            $('.reset_pwd #conform-modify').attr('disabled',true);
            return;
        }
        $('.reset_pwd .tip').hide();
        $('.reset_pwd #conform-modify').attr('disabled',false);
    });
    $('.reset_pwd #conform-pwd').on('blur',function () {
        if(!$('.reset_pwd #pwd').val() || !$('.reset_pwd #conform-pwd').val()){
            $('.reset_pwd .tip').show();
            $('.reset_pwd .tip').html('请填写完必填信息');
            $('.reset_pwd #conform-modify').attr('disabled',true);
            return;
        }
        if($('.reset_pwd #pwd').val() != $('.reset_pwd #conform-pwd').val()){
            $('.reset_pwd .tip').show();
            $('.reset_pwd .tip').html('两次密码输入不一致');
            $('.reset_pwd #conform-modify').attr('disabled',true);
            return;
        }
        $('.reset_pwd .tip').hide();
        $('.reset_pwd #conform-modify').attr('disabled',false);
    });
    $('.reset_pwd #conform-modify').on('click',function () {
        $.ajax({
            url:'/baixiu/pwdUpdate',
            type:'post',
            dataType:'json',
            data:{
                userName:$('.reset_pwd #user-name').val(),
                passWord:$('.reset_pwd #pwd').val()
            },
            success:function (data) {
                if(data.status == 0){
                    window.location='/baixiu/jumpToLogin';
                }else {
                    alert('密码修改失败');
                }
            },
            error:function () {
                alert('密码修改失败');
            }
        });
        return false;
    });
});