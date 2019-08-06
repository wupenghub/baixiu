var hiddenList = [];
var modifyListId = [];
var sonListId = [];
var parentListId = [];
var mnueObj = null;
var currentMnueParentObj = null;
var mnueIdList = [];
$(function () {
    utils.renderPage(function (dataJson) {
        var tbody = $('.mnue-manger table tbody');
        if(dataJson.dataJsonArr) {
            for (var i = 0; i < dataJson.dataJsonArr.length; i++) {
                utils.addTableMnues(tbody, dataJson.dataJsonArr[i], null, 0);
            }
        }
    });
    $('#mnue-permission-add').on('click', function () {
        renderMnueList(function () {
            showPermission();
        });
    });
    $('#mnue-permission-maintenance').on('click', function () {
        mnueIdList = [];
        if (!$('#mnue-permission-code').val()) {
            alert('请输入菜单权限代码');
            return;
        }
        $('#mnue_permission_add tbody input[type=checkbox]').each(function (i, val) {
            if ($(val).is(':checked')) {
                mnueIdList.push(val.dataset.id);
            }
        });
        if (mnueIdList.length == 0) {
            alert('请给该角色分配对应的菜单访问权限');
            return;
        }
        utils.ajaxSend({
            type: 'post',
            url: '/baixiu/maintenancePermission',
            data: {
                permissionsCode: $('#mnue-permission-code').val(),
                mnueIdList: mnueIdList.join(',')
            },
            dataType: "json"
        }, function (data) {

        }, function (error) {

        });
    });
    getMnuePermissionListData(1, utils.pageSize);
});
function showPermission() {
    if ($('#mnue-permission-code').val()) {
        //如果权限角色代码不为空,发送ajax请求权限对应的可访问菜单
        utils.ajaxSend({
            type: 'get',
            url: '/baixiu/queryMnuesByPermission',
            data: {
                permissionsCode: $('#mnue-permission-code').val()
            },
            dataType: "json"
        }, function (data) {
            if(data.status == 0) {
                //先清空权限状态
                $('#mnue_permission_add table tbody input[type=checkbox]').each(function (index,obj) {
                    $(obj).prop("checked",false);
                });
                $('#mnue_permission_add table tbody input[type=checkbox]').each(function (index,obj) {
                    var mnueId = obj.dataset.id;
                    data.returnData.forEach(function (val) {
                        var permissionMnueId = val.mnueId;
                        if(mnueId == permissionMnueId){
                            $(obj).prop("checked",true);
                        }
                    })
                })
            }
        }, function (error) {

        });
    }
}
function renderMnueList(fun) {
    utils.ajaxSend({
        type: 'get',
        url: '/baixiu/getMnueList',
        data: {},
        dataType: "json"
    }, function (data) {
        $('#mnue_permission_add table tbody').empty();
        mnueObj = data.dataJsonArr[0];
        for (var i = 0; i < data.dataJsonArr.length; i++) {
            utils.addTableMnuesPremisson($('#mnue_permission_add table tbody'), data.dataJsonArr[i], null, 0);
        }
        if (fun)
            fun();
    }, function (error) {

    });
}

function getMnuePermissionListData(offset, pageSize) {
    utils.ajaxSend({
        type: 'get',
        url: '/baixiu/searchMnuePremissionList',
        data: {offset, pageSize},
        dataType: "json"
    }, function (data) {
        var html = template('mnue_permission_list_items', data.returnData);
        utils.pageList(data, $('.pages-nav'), function (currentPage, pageSize) {
            getMnuePermissionListData(currentPage, pageSize);
        });
        $('#mnue_permission_list_content').html(html);
        //渲染分页页签
        returnData = data.returnData;
        data.returnData.totalCount = data.totalCount;
        utils.pageList(data, $('.pages-nav'), function (currentPage, pageSize) {
            getMnuePermissionListData(currentPage, pageSize);
        });
    }, function (error) {

    });
}

function toggle(flag, obj, jsonObj) {
    jsonObj = JSON.parse(Base64.decode(jsonObj));
    findAllID(obj, jsonObj);
    var isOpen = $(flag + jsonObj.id).attr('data-open');
    if (isOpen == 'on') {
        for (var i = 0; i < hiddenList.length; i++) {
            $(flag + hiddenList[i]).hide();
        }
        $(obj).attr("class", "glyphicon glyphicon-menu-right");
        $(flag + jsonObj.id).attr('data-open', 'off');
    } else {
        for (var i = 0; i < hiddenList.length; i++) {
            // if($('#mnuesManger' + hiddenList[i]).is(':visible')){
            $(flag + hiddenList[i]).show();
            // }
        }
        $(obj).attr("class", "glyphicon glyphicon-menu-down");
        $(flag + jsonObj.id).attr('data-open', 'on');
    }
    hiddenList = [];
}

function choosePerMission(obj, jsonObj) {
    jsonObj = JSON.parse(Base64.decode(jsonObj));
    modifyListId = [];
    sonListId = [];
    parentListId = [];
    currentMnueParentObj = null;
    sonListId.push(obj.dataset.id);
    findSonAllID(obj, jsonObj);
    findParentAllID(obj, jsonObj);
    if (sonListId) {
        for (var i = 0; i < sonListId.length; i++) {
            modifyListId.push(sonListId[i]);
        }
    }
    if (parentListId) {
        for (var i = 0; i < parentListId.length; i++) {
            modifyListId.push(parentListId[i]);
        }
    }
    if ($(obj).is(':checked')) {
        //如果菜单选中，则其所对应的父级菜单和子级菜单都选中
        for (var i = 0; i < modifyListId.length; i++) {
            $("#check" + modifyListId[i]).prop("checked", true);
        }
    } else {
        //如果菜单取消选中，则其所对应子级菜单也要取消选中
        for (var i = 0; i < sonListId.length; i++) {
            $("#check" + sonListId[i]).prop("checked", false);
        }
    }
}

function findAllID(obj, jsonObj) {
    if (jsonObj.sonList) {
        for (var i = 0; i < jsonObj.sonList.length; i++) {
            hiddenList.push(jsonObj.sonList[i].id);
            findAllID(obj, jsonObj.sonList[i]);
        }
    }
}

function findSonAllID(obj, jsonObj) {
    if (jsonObj.sonList) {
        for (var i = 0; i < jsonObj.sonList.length; i++) {
            sonListId.push(jsonObj.sonList[i].id);
            findSonAllID(obj, jsonObj.sonList[i]);
        }
    }
}

function findParentAllID(obj, jsonObj) {
    if (jsonObj.parent_id) {
        parentListId.push(jsonObj.parent_id);
        findObjById(jsonObj, mnueObj);
        findParentAllID(obj, currentMnueParentObj);
    }
}

//根据菜单对象查找其对应的父菜单对象
function findObjById(jsonObj, obj) {
    if (jsonObj.parent_id == obj.id) {
        currentMnueParentObj = obj;
        return;
    }
    if (obj.sonList) {
        for (var i = 0; i < obj.sonList.length; i++) {
            if (jsonObj.parent_id == obj.sonList[i].id) {
                currentMnueParentObj = obj.sonList[i];
                break;
            } else {
                findObjById(jsonObj, obj.sonList[i]);
            }
        }
    }
}

function mnuePermissionChoose() {
    //发送ajax请求权限
    utils.ajaxSend({
        type: 'get',
        url: '/baixiu/searchPremissionList',
        data: {},
        dataType: "json"
    }, function (data) {
        if (data.status == 0) {
            var html = template('permission_list', data);
            $('.mnue-permission-manger-model').html(html);
            $('#mnue-permission-manger').modal('show');
        }
    }, function (error) {

    });
}

function chooseMnuePermission(obj) {
    $('#mnue-permission-manger').modal('hide');
    $('#mnue-permission-code').val(obj.dataset.permissionCode);
    $('#mnue-permission-desc').val($(obj).html());
    showPermission();
}

function modifyPermission(code,desc) {
    $('#tab_li_list').removeClass('active');
    $('#tab_li_list_add').addClass('active');
    $('#mnue_permission_list').removeClass('active');
    $('#mnue_permission_add').addClass('active');
    $('#mnue-permission-code').val(code);
    $('#mnue-permission-desc').val(desc);
    renderMnueList(function () {
        showPermission();
    });
}