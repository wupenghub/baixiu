var hiddenList = [];
$(function () {
    utils.renderPage(function (dataJson) {
        var tbody = $('.mnue-manger table tbody');
        for (var i = 0; i < dataJson.dataJsonArr.length; i++) {
            utils.addTableMnues(tbody, dataJson.dataJsonArr[i], null, 0);
        }
    });
    $('#mnue-permission-add').on('click',function () {
        utils.ajaxSend({
            type: 'get',
            url: '/baixiu/getMnueList',
            data: {},
            dataType: "json"
        },function (data) {
            $('#mnue_permission_add table tbody').empty();
            for(var i = 0;i<data.dataJsonArr.length;i++){
                utils.addTableMnuesPremisson($('#mnue_permission_add table tbody'),data.dataJsonArr[i],null,0);
            }
        },function (error) {

        });
    });
    getMnuePermissionListData(1, utils.pageSize);
});
function getMnuePermissionListData(offset, pageSize) {
    utils.ajaxSend({
        type: 'get',
        url: '/baixiu/searchMnuePremissionList',
        data: {offset, pageSize},
        dataType: "json"
    }, function (data) {
        var html = template('mnue_permission_list_items',data.returnData);
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

function findAllID(obj, jsonObj) {
    if (jsonObj.sonList) {
        for (var i = 0; i < jsonObj.sonList.length; i++) {
            hiddenList.push(jsonObj.sonList[i].id);
            findAllID(obj, jsonObj.sonList[i]);
        }
    }
}