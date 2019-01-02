var hiddenList = [];
$(function () {
    var data = $("#template").html().replace(/&#34;/g,'"');
    var dataJson = JSON.parse(data);
    var rootNode = $('.aside .nav');
    var tbody = $('.mnue-manger table tbody');
    $('.avatar').prop('src',dataJson.user.avatar);
    $('.name').html(dataJson.user.nickname);
    for(var i = 0;i<dataJson.dataJsonArr.length;i++){
        //循环遍历集合元素,添加菜单目录。
        utils.addMnues(rootNode,dataJson.dataJsonArr[i]);
        utils.addTableMnues(tbody,dataJson.dataJsonArr[i],null,0);
    }
});
function toggle(obj,jsonObj) {
    findAllID(obj,jsonObj);
    var isOpen = $('#mnuesManger'+jsonObj.id).attr('data-open');
    if(isOpen == 'on') {
        for(var i = 0;i<hiddenList.length;i++){
            $('#mnuesManger' + hiddenList[i]).hide();
        }
        $(obj).attr("class","glyphicon glyphicon-menu-right");
        $('#mnuesManger'+jsonObj.id).attr('data-open','off');
    }else{
        for(var i = 0;i<hiddenList.length;i++){
            // if($('#mnuesManger' + hiddenList[i]).is(':visible')){
            $('#mnuesManger' + hiddenList[i]).show();
            // }
        }
        $(obj).attr("class","glyphicon glyphicon-menu-down");
        $('#mnuesManger'+jsonObj.id).attr('data-open','on');
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
//修改菜单点击事件
function mnueModify(id) {
}
//删除菜单点击事件
function mnueDelete(id) {
    $.ajax({
        type:'get',
        url:'/baixiu/menuDelete',
        data:{id},
        dataType:'json',
        success:function (data) {
            // 删除成功，重新绚烂菜单节点
            if(data.status == 1){
                alert(data.desc);
            }else {
                var rootNode = $('.aside .nav');
                var tbody = $('.mnue-manger table tbody');
                rootNode.html('');
                tbody.html('');
                for (var i = 0; i < data.dataJsonArr.length; i++) {
                    //循环遍历集合元素,添加菜单目录。
                    utils.addMnues(rootNode,data.dataJsonArr[i]);
                    utils.addTableMnues(tbody, data.dataJsonArr[i], null, 0);
                }
            }

        },
        error:function (XMLHttpRequest, textStatus, errorThrown) {
            // alert("请求失败！");
        }
    });
}
//添加子菜单点击事件
function sonMnueAdd(id) {
}