var returnData = null;
$(function () {
    var data = $("#template").html().replace(/&#34;/g, '"');
    var dataJson = JSON.parse(data);
    var rootNode = $('.aside .nav');
    $('.avatar').prop('src', dataJson.user.avatar);
    $('.name').html(dataJson.user.nickname);
    for (var i = 0; i < dataJson.dataJsonArr.length; i++) {
        //循环遍历集合元素,添加菜单目录。
        utils.addMnues(rootNode, dataJson.dataJsonArr[i]);
    }
    $('#personMaintenance_modify .btn_modify').on('click',function () {
        if(check()){
            uploadDataByObj({
                email:$('#personMaintenance_modify .account').val(),
                oldPwd:$('#personMaintenance_modify .old_pwd').val(),
                modifyPwd:$('#personMaintenance_modify .modify_pwd').val(),
                confirmPwd:$('#personMaintenance_modify .confirm_pwd').val(),
                nickName:$('#personMaintenance_modify .nick_name').val(),
                level:$('#personMaintenance_modify #level_type_code_view').val(),
                templateFile:$("#personMaintenance_modify .actorInputFile")[0].files[0]
            },'/baixiu/modifyUser');
        }
    });
    getInitInfo();

});

function getInitInfo() {
    utils.ajaxSend({
        type: 'get',
        url: '/baixiu/searchUser',
        data: {},
        dataType: "json"
    }, function (user) {
        console.log(JSON.stringify(user));
        $('#personMaintenance_modify .account').val(user.email);
        $('#personMaintenance_modify .old_pwd').val('');
        $('#personMaintenance_modify .nick_name').val(user.nickname);
        $('#personMaintenance_modify #level_type_desc_view').val(user.levelDesc);
        $('#personMaintenance_modify #level_type_code_view').val(user.level);
    }, function (error) {

    });
}

function check() {
    if(!$('#personMaintenance_modify .old_pwd').val()){
        alert('原始密码不能为空');
        return false;
    }
    if(!$('#personMaintenance_modify .modify_pwd').val()){
        alert('修改密码不能为空');
        return false;
    }
    if(!$('#personMaintenance_modify .confirm_pwd').val()){
        alert('确认密码不能为空');
        return false;
    }
    if($('#personMaintenance_modify .confirm_pwd').val()!=$('#personMaintenance_modify .modify_pwd').val()){
        alert('二次输入的密码不一致');
        return false;
    }
    return true
}

function showModal(queryType) {
    $('.model-manger').html('');
    if (queryType == 'FY') {
        $('.modal-title').html('费用类型列表');
    } else if (queryType == 'GS') {
        $('.modal-title').html('公司类型列表');
    } else if (queryType == 'ZJ') {
        $('.modal-title').html('职级类型列表');
    }
    utils.ajaxSend({
        type: 'get',
        url: '/baixiu/searchType',
        data: {queryType},
        dataType: "json"
    }, function (data) {
        console.log(data)
        var html = template('typeList',data);
        $('.type-list').html(html);
    }, function (error) {

    });
}
function showInfo(type,obj) {
    if (type == 'FY') {
        $('#cost_modify .cost_type_desc_view').val(obj.innerHTML);
        $('.companyMaintenance .cost_type_code_view').val(obj.dataset.costCode);
    } else if (type == 'GS') {
        $('#cost_modify .company_type_desc_view').val(obj.innerHTML);
        $('#cost_modify .company_type_code_view').val(obj.dataset.costCode);
    } else if (type == 'ZJ') {
        $('.personMaintenance #level_type_desc_view').val(obj.innerHTML);
        $('.personMaintenance #level_type_code_view').val(obj.dataset.costCode);
    }
    $('.level-manger-tree').modal('hide');
}

function uploadDataByObj(obj,url) {
    var formData = new FormData();//获取form值
    for(var item in obj){
        formData.append(item,obj[item]);
        console.log(item+'==='+obj[item]);
    }
    utils.ajaxSend({
        type:'post',
        url,
        data:formData,
        processData: false,  // 不处理数据
        contentType:false  // 不设置内容类型

    },function (data) {

    },function (error) {

    });
}