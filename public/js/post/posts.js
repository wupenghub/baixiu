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