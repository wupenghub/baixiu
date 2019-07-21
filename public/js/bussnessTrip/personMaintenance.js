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