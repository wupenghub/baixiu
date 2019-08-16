var returnData = null;
$(function () {
    utils.renderPage();
    $('#permission-list').on('click', function () {
        init();
        //获取费用类型数据
        getPermissionTypeListData(1, utils.pageSize);
    });
    $('#permission-modify').on('click', function () {
        init();

    });
    $('#permission-add').on('click', function () {
        init();
        utils.ajaxSend({
            type: 'get',
            url: '/baixiu/getpermissionTypeIsByDay',
            data: {},
            dataType: "json"
        }, function (result) {
            console.log(result)
            if (result.status == 0) {
                var fixHtml = template('fixType', result);
                console.log(fixHtml);
                $('.fix_group_add').show();
                $('.fix_permission').html(fixHtml);
            }
        }, function (error) {

        });
    });
    $('#permission-type-modify').on('click', function () {
        if (!$('#permission_type_desc_modify').val()) {
            alert('请输入数据类型名称');
            return;
        }
        utils.ajaxSend({
            type: 'post',
            url: '/baixiu/modifyDataPermissionTypeDesc',
            data: {
                permissionTypeCode: $('.permission_type_code_view').val(),
                permissionTypeDesc: $('#permission_type_desc_modify').val(),
            },
            dataType: "json"
        }, function (data) {
            if (data.status == 0) {
                $('.permission_type_desc_view').val($('#permission_type_desc_modify').val());
            }
        }, function (error) {
            alert(error);
        });
    });

    $('.permission-search').on('click', function () {
        queryPermissionDesc();
    });
    $('#permission-standard-add').on('click', function () {
        var permissionCode = $('#permission_add .permission_type_code_view').val();
        var permissionDesc = $('#permission_add .permission_type_desc_view').val();
        if (!permissionCode) {
            alert('请填写菜单类型代码');
            return;
        }
        if (!permissionDesc) {
            alert('菜单类型描述');
            return;
        }
        utils.ajaxSend({
            type: 'post',
            url: '/baixiu/addPermissionInfo',
            data: {permissionCode, permissionDesc},
            dataType: "json"
        }, function (data) {
            if (data.status == 0) {
                $('.permission_list_li').addClass('active');
                $('.permission_add_li').removeClass('active');
                $('#permission_list').addClass('active');
                $('#permission_add').removeClass('active');
                getPermissionTypeListData(1, utils.pageSize);
            } else {
                alert(data.desc);
            }
        }, function (error) {
            alert(error);
        });
    });
    //获取费用类型数据
    getPermissionTypeListData(1, utils.pageSize);
});

function queryPermissionDesc() {
    if (!$('.permission_type_code_view').val() && !$('.permission_type_desc_view').val()) {
        alert('请输入数据类型');
        return;
    }
    utils.ajaxSend({
        type: 'get',
        url: '/baixiu/searchDataPermissionTypeInfo',
        data: {
            permissionTypeCode: $('.permission_type_code_view').val(),
        },
        dataType: "json"
    }, function (data) {
        if (data.status == 0) {
            if (data.returnData.length > 0) {
                $('.permission_type_div').show();
                $('#permission_type_desc_modify').val(data.returnData[0].perDesc);
            } else {
                $('.permission_type_div').hide();
                $('#permission_type_desc_modify').val('');
            }
        } else {

        }
    }, function (error) {

    });
}

function init() {
    $('.permission_type_desc_view').val('');
    $('.permission_type_code_view').val('');
    $('.company_type_desc_view').val('');
    $('.company_type_code_view').val('');
    $('.level_desc_view').val('');
    $('.level_code_view').val('');
    $('#permission_type_desc_modify').val('');
    $('#permission_type_max_count_modify').val('');
    $('.max_amount_view').val('');
    $('.permission_type_div').hide();
    $('.fix_permission').html('');
    $('.fix_group').html('');
}

function getPermissionTypeListData(offset, pageSize) {
    utils.ajaxSend({
        type: 'get',
        url: '/baixiu/searchDataPermissionTypeList',
        data: {offset, pageSize},
        dataType: "json"
    }, function (data) {
        var html = template('permissionsList', data);
        console.log(html)
        $('.dataPermissionMaintenance table tbody').html(html);
        $('.permission_type_edit').on('click', function () {
            $('.permissionMaintenance .permission-tabs li.permission_list_li').removeClass('active');
            $('.permissionMaintenance .permission-tabs li.permission_add_li').removeClass('active');
            $('.permissionMaintenance .permission-tabs li.permission_modify_li').addClass('active');
            $('.permissionMaintenance .permission-content div#permission_list').removeClass('active');
            $('.permissionMaintenance .permission-content div#permission_add').removeClass('active');
            $('.permissionMaintenance .permission-content div#permission_modify').addClass('active');
            $('#permission-code').val(this.dataset.code);
            var dataCode = this.dataset.code;
            var permissionTypeCode = dataCode.split('@')[0];//费用类型对应的code
            var permissionTypeDesc = dataCode.split('@')[1];//费用类型描述
            $('.permission_type_desc_view').val(permissionTypeDesc);
            $('.permission_type_code_view').val(permissionTypeCode);
            queryPermissionDesc();
        });
        $('.permission_type_delete').on('click', function () {
            var dataCode = this.dataset.code;
            deletepermissionStandard(dataCode);
        });
        //渲染分页页签
        returnData = data.returnData;
        data.returnData.totalCount = data.totalCount;
        utils.pageList(data, $('.pages-nav'), function (currentPage, pageSize) {
            getPermissionTypeListData(currentPage, pageSize);
        });
    }, function (error) {

    });
}

function deletepermissionStandard(dataCode) {
    utils.ajaxSend({
        type: 'get',
        url: '/baixiu/permissionTypeDelete',
        data: {permissionTypeCode: dataCode},
        dataType: "json"
    }, function (data) {
        if (data.status == 0) {
            getpermissionTypeListData(1, utils.pageSize);
        }
    }, function (error) {

    });
}

function showModal() {
    utils.ajaxSend({
        type: 'get',
        url: '/baixiu/searchDataPermissionTypeList',
        data: {},
        dataType: "json"
    }, function (data) {
        var html = template('permissionList', data);
        console.log(html)
        $('.permission-list').html(html);
        $('#modal_tree').modal('show');
    }, function (error) {

    });
}

function showInfo(obj) {
    $('.permission_type_desc_view').val(obj.innerHTML);
    $('.permission_type_code_view').val(obj.dataset.permissionCode);
    $('.permission-manger-tree').modal('hide');
}
