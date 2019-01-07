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
    getPostsData(0,20);
});
function getPostsData(offset,pageSize) {
    $.ajax({
        type:'get',
        url:'/baixiu/getArticleApprovalList',
        dataType:'json',
        data:{offset,pageSize},
        success:function (data) {
            var statusListtml = template('statusList',data);
            $('.status-options').html(statusListtml);
            var categoryListHtml = template('categoryList',data)
        },
        error:function () {
           alert('请求出问题');
        }
    });
}