$(function () {
    utils.renderPage(function (dataJson) {
        var tbody = $('.mnue-manger table tbody');
        for (var i = 0; i < dataJson.dataJsonArr.length; i++) {
            utils.addTableMnues(tbody, dataJson.dataJsonArr[i], null, 0);
        }
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
        console.log(data)
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