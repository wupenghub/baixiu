var hiddenList = [];
var mnueObj = null;
var isUpdate = 'N';
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
    $('.mnue-manger .save').on('click',function () {
        //判断必填信息是否已经填写
        if(!$('.mnue-manger .search_text').val()){
            alert('请选择上级菜单');
            return;
        }
        if(!$('.mnue-manger .mnue_desc').val()){
            alert('请填写菜单名称');
            return;
        }
        //所有验证通过，发送请求进行
        addMnues(mnueObj);
    });
    $('.mnue-manger .back').on('click',function () {
        $('.mnue-manger .mnue-tabs li:first-child').addClass('active');
        $('.mnue-manger .mnue-tabs li:last-child').removeClass('active');
        $('.mnue-manger .mnue-content div:first-child').addClass('active');
        $('.mnue-manger .mnue-content div:last-child').removeClass('active');
    });
});
/*function toggle(obj,jsonObj) {
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
}*/
function toggle(flag,obj,jsonObj) {
    findAllID(obj,jsonObj);
    var isOpen = $(flag+jsonObj.id).attr('data-open');
    if(isOpen == 'on') {
        for(var i = 0;i<hiddenList.length;i++){
            $(flag + hiddenList[i]).hide();
        }
        $(obj).attr("class","glyphicon glyphicon-menu-right");
        $(flag+jsonObj.id).attr('data-open','off');
    }else{
        for(var i = 0;i<hiddenList.length;i++){
            // if($('#mnuesManger' + hiddenList[i]).is(':visible')){
            $(flag + hiddenList[i]).show();
            // }
        }
        $(obj).attr("class","glyphicon glyphicon-menu-down");
        $(flag+jsonObj.id).attr('data-open','on');
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
    isUpdate = 'Y';
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
                addMnueList(data.dataJsonArr);
            }
        },
        error:function (XMLHttpRequest, textStatus, errorThrown) {
            // alert("请求失败！");
        }
    });
}
//添加菜单节点事件，在增删改之后调用
function addMnueList(array) {
    var rootNode = $('.aside .nav');
    var tbody = $('.mnue-manger table tbody');
    rootNode.html('');
    tbody.html('');
    for (var i = 0; i < array.length; i++) {
        //循环遍历集合元素,添加菜单目录。
        utils.addMnues(rootNode,array[i]);
        utils.addTableMnues(tbody, array[i], null, 0);
    }
}
//添加子菜单点击事件
function sonMnueAdd(obj) {
    isUpdate = 'N';
    //跳转到添加子菜单的页面
    $('.mnue-manger .mnue-tabs li:first-child').removeClass('active');
    $('.mnue-manger .mnue-tabs li:last-child').addClass('active');
    $('.mnue-manger .mnue-content div:first-child').removeClass('active');
    $('.mnue-manger .mnue-content div:last-child').addClass('active');
    //将点击链接的节点信息描述设置到文本框中
    $('.mnue-manger .search_text').val(obj.mnue_desc);
    //先解除原先点击事件
    $('.mnue-manger .save').unbind();
    $('.mnue-manger .save').on('click',function () {
        //判断必填信息是否已经填写
        if(!$('.mnue-manger .search_text').val()){
            alert('请选择上级菜单');
            return;
        }
        if(!$('.mnue-manger .mnue_desc').val()){
            alert('请填写菜单名称');
            return;
        }
        //所有验证通过，发送请求进行
        addMnues(obj);
    });
}
//添加子菜单ajax请求
function addMnues(obj) {
    if(!obj){
        alert('无法获取到父节点！');
        return;
    }
    $.ajax({
        url:'/baixiu/sonMnueAdd',
        type:'post',
        dataType:'json',
        data:{
            id:obj.id,
            mnueDesc:$('.mnue-manger .mnue_desc').val(),
            parentId:obj.id,
            url:$('.mnue-manger .mnue_url').val(),
            isUpdate:isUpdate
        },
        success:function (data) {
            if(data.status == 0){
                //添加成功
                addMnueList(data.dataJsonArr);
                //跳转到添加子菜单的页面
                $('.mnue-manger .mnue-tabs li:first-child').addClass('active');
                $('.mnue-manger .mnue-tabs li:last-child').removeClass('active');
                $('.mnue-manger .mnue-content div:first-child').addClass('active');
                $('.mnue-manger .mnue-content div:last-child').removeClass('active');
            }else{
                //添加失败
                alert('添加失败！');
            }
        },
        error:function () {
            alert('出现异常！');
        }
    })
}
function mnueTreeInModel() {
    var data = $("#template").html().replace(/&#34;/g,'"');
    var dataJson = JSON.parse(data);
    $('.mnue-manger-tree .mnue-manger-model').html('');
    for(var i = 0;i<dataJson.dataJsonArr.length;i++){
        //循环遍历集合元素,添加菜单目录。
        utils.mnueTreeInModel($('.mnue-manger-tree .mnue-manger-model'),dataJson.dataJsonArr[i],null,0);
    }

}
function chooseMnue(obj) {
    isUpdate = 'N';
    mnueObj = obj;
    $('.mnue-manger .search_text').val(mnueObj.mnue_desc);
    $('.mnue-manger-tree').modal('hide');
}