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
    //获取文章审阅数据
    getOrderListData(1, utils.pageSize);
});

function getOrderListData(offset, pageSize) {
    // offset--;
    var userStr = localStorage.getItem('email');
    var email = '';
    if (userStr) {
        email = JSON.parse(userStr)[0];
    }
    utils.ajaxSend({
        type: 'get',
        url: '/baixiu/getOrderList',
        dataType: 'json',
        data: {offset, pageSize,email}
    }, function (data) {
        console.log(data);
        var ordersListHtml = template('ordersList',data);
        $('.orders table tbody').html(ordersListHtml);
       //渲染分页页签
          returnData = data.returnData;
         data.returnData.totalCount = data.totalCount;
         utils.pageList(data,$('.pages-nav'),function (currentPage,pageSize) {
             // var currentPage = parseInt(pageObj.returnData.offset);
             console.log(currentPage+'====='+pageSize)
             getOrderListData(currentPage, pageSize);
         });
         //给文章信息绑定删除按钮
         // bindDelete(offset,pageSize);
    }, function (error) {
        alert('请求出问题');
    });
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