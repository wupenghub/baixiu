$(function () {
    var data = $("#template").html().replace(/&#34;/g,'"');
    var dataJson = JSON.parse(data);
    var rootNode = $('.aside .nav');
    $('.avatar').prop('src',dataJson.user.avatar);
    $('.name').html(dataJson.user.nickname);
    for(var i = 0;i<dataJson.dataJsonArr.length;i++){
        //循环遍历集合元素,添加菜单目录。
        utils.addMnues(rootNode,dataJson.dataJsonArr[i]);
    }
    //获取文章审阅数据
    getPostsData(0,20,'all','all');
});
function getPostsData(offset,pageSize,categoryId,postId) {
    $.ajax({
        type:'get',
        url:'/baixiu/getArticleApprovalList',
        dataType:'json',
        data:{offset,pageSize,categoryId,postId},
        success:function (data) {
            //渲染文章审批状态
            var statusListtml = template('statusList',data);
            $('.status-options').html(statusListtml);
            //渲染文章分类
            var categoryListHtml = template('categoryList',data);
            $('.category-list').html(categoryListHtml);
            //渲染文章审批信息
            var postsListHtml = template('postsList',data);
            $('.posts table tbody').html(postsListHtml);
            bindDelete(offset,pageSize);
        },
        error:function () {
           alert('请求出问题');
        }
    });
}
//筛选功能
function seachPostsList() {
    var categoryValue = $('#category-list').val();
    var postStatus = $('#status-options').val();
    getPostsData(0,20,categoryValue,postStatus);
}
//注册删除事件
function bindDelete(offset,pageSize) {
    //注册事件时先接触点击事件防止事件多次绑定
    $('.posts table tbody').unbind();
    $('.posts table tbody').on('click','.post-delete',function (event) {
        var articleId = $(event.target).data('flag');
        //编删除功能
        var categoryId = $('#category-list').val();
        var postId = $('#status-options').val();
        $.ajax({
            type:'get',
            url:'/baixiu/articleDelete',
            dataType:'json',
            data:{offset,pageSize,categoryId,postId,articleId},
            success:function (data) {
                //删除成功，重新请求数据刷新界面
                getPostsData(0,20,categoryId,postId);
            },
            error:function (e) {
                alert('请求出错！');
            }
        })
    });
}