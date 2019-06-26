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
    $('#cost-list').on('click',function () {

    });

    $('#cost-search').on('click',function () {
        if(!$('#cost-no').val()){
            alert('请输入订单编号');
            return;
        }
    });
    //获取费用类型数据
    getCostTypeListData(1, utils.pageSize);
});

function getCostTypeListData(offset, pageSize) {
    utils.ajaxSend({
        type: 'get',
        url: '/baixiu/searchCostTypeList',
        data: {offset,pageSize},
        dataType: "json"
    },function (data) {
        console.log(data)
        var html = template('costsList',data);
        $('.cost table tbody').html(html);
        $('.cost_type_edit').on('click',function () {
            $('.cost .cost-tabs li:first-child').removeClass('active');
            $('.cost .cost-tabs li:last-child').addClass('active');
            $('.cost .cost-content div:first-child').removeClass('active');
            $('.cost .cost-content div:last-child').addClass('active');
            $('#cost-code').val(this.dataset.code);
        });
        //渲染分页页签
        returnData = data.returnData;
        data.returnData.totalCount = data.totalCount;
        utils.pageList(data,$('.pages-nav'),function (currentPage,pageSize) {
            getCostTypeListData(currentPage, pageSize);
        });
    },function (error) {

    })
}

//注册删除事件
function bindDelete(offset, pageSize) {
    //注册事件时先接触点击事件防止事件多次绑定
    $('.posts table tbody').unbind();
    $('.posts table tbody').on('click', '.post-delete', function (event) {
        var articleId = $(event.target).data('flag');
        //编删除功能
        var categoryId = $('#category-list').val();
        var postId = $('#status-options').val();
        $.ajax({
            type: 'get',
            url: '/baixiu/articleDelete',
            dataType: 'json',
            data: {offset, pageSize, categoryId, postId, articleId},
            success: function (data) {
                //删除成功，重新请求数据刷新界面
                if (!returnData) {
                    getPostsData(1, utils.pageSize, categoryId, postId);
                } else {
                    getPostsData(returnData.offset, returnData.pageSize, categoryId, postId);
                }
            },
            error: function (e) {
                alert('请求出错！');
            }
        })
    });
}

function editCostType(objStr) {

}
