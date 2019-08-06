var hiddenList = [];
var isUpdate = 'N';
$(function () {
    utils.renderPage();
    var tbody = $('.address-manger table tbody');
    $('.address-manger .save').on('click',function () {
        //判断必填信息是否已经填写
        if(!$('.address-manger .search_text').val()){
            alert('请选择上级地址');
            return;
        }
        if(!$('.address-manger .mnue_desc').val()){
            alert('请填写地址名称');
            return;
        }
        if(!$('.address-manger .mnue_url').val()){
            alert('请填写地址代码');
            return;
        }
        //所有验证通过，发送请求进行
        addMnues(window.obj);
    });
    $('.address-manger .back').on('click',function () {
        $('.address-manger .address-tabs li:first-child').addClass('active');
        $('.address-manger .address-tabs li:last-child').removeClass('active');
        $('.address-manger .address-content div:first-child').addClass('active');
        $('.address-manger .address-content div:last-child').removeClass('active');
        init();
    });
    $('#address-add').off('click').on('click',function () {
        isUpdate = 'N';
    });
    $('#address-list').off('click').on('click',function () {
        init();
    });
    //通过发送请求获取地址列表
    utils.ajaxSend({type: 'get',
        url: '/baixiu/queryAddressList',
        data: {},
        dataType: "json"
    },function (result) {
        console.log(result);
        window.returnDate = result.returnDate;
        for(var i = 0;i<result.returnDate.length;i++){
            //循环遍历集合元素,添加公司目录。
            utils.addTableMnues(tbody,result.returnDate[i],null,0);
        }
    },function (error) {

    });
});
function init() {
    $('.address-manger .mnue_desc').val('');
    $('.address-manger .mnue_url').val('');
    $('.address-manger .search_text').val('');
}
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
function mnueModify(obj) {
    isUpdate = 'Y';
    window.sonObj = obj;
    $('.address-manger .address-tabs li:first-child').removeClass('active');
    $('.address-manger .address-tabs li:last-child').addClass('active');
    $('.address-manger .address-content div:first-child').removeClass('active');
    $('.address-manger .address-content div:last-child').addClass('active');
    //将点击链接的节点信息描述设置到文本框中
    $('.address-manger .mnue_desc').val(obj.mnue_desc);
    $('.address-manger .mnue_url').val(obj.id);
    // utils.findParentBySon(JSON.parse($("#template").html().replace(/&#34;/g,'"')).dataJsonArr,obj);
    utils.findParentBySon(window.returnDate,obj);
    $('.address-manger .search_text').val(utils.parentObj?utils.parentObj.mnue_desc:'');
    // mnueObj = utils.parentObj;
    window.parentObj = utils.parentObj;
    $('.address-manger .save').unbind();
    $('.address-manger .save').on('click',function () {
        //判断必填信息是否已经填写
        if(!$('.address-manger .search_text').val()){
            alert('请选择上级地址');
            return;
        }
        if(!$('.address-manger .mnue_desc').val()){
            alert('请填写地址名称');
            return;
        }
        if(!$('.address-manger .mnue_url').val()){
            alert('请填写地址代码');
            return;
        }
        //所有验证通过，发送请求进行
        addMnues(obj);
    });

}
//删除菜单点击事件
function mnueDelete(obj) {
    var id = obj.id;
    utils.ajaxSend({type:'post',
        url:'/baixiu/deleteAddress',
        data:{id},
        dataType:'json'},
        function (result) {
            // 删除成功，重新绚烂菜单节点
            console.log(result)
            if(result.status == 1){
                alert(result.desc);
            }else {
                $('.address-manger table tbody').empty();
                for(var i = 0;i<result.returnData.length;i++){
                    //循环遍历集合元素,添加公司目录。
                    utils.addTableMnues($('.address-manger table tbody'),result.returnData[i],null,0);
                }
            }
        },function (error) {

        });
}
//添加菜单节点事件，在增删改之后调用
function addMnueList(array) {
    var rootNode = $('.aside .nav');
    var tbody = $('.address-manger table tbody');
    rootNode.html('');
    tbody.html('');
    for (var i = 0; i < array.length; i++) {
        //循环遍历集合元素,添加菜单目录。
        utils.addMnues(rootNode,array[i]);
        utils.addTableMnues(tbody, array[i], null, 0);
        utils.mnueTreeInModel($('.address-manger-tree .address-manger-model'), array[i], null, 0);
    }
}
//添加子菜单点击事件
function sonMnueAdd(obj) {
    isUpdate = 'N';
    // window.obj = obj;
    window.parentObj = obj;
    //跳转到添加子菜单的页面
    $('.address-manger .address-tabs li:first-child').removeClass('active');
    $('.address-manger .address-tabs li:last-child').addClass('active');
    $('.address-manger .address-content div:first-child').removeClass('active');
    $('.address-manger .address-content div:last-child').addClass('active');
    //将点击链接的节点信息描述设置到文本框中
    $('.address-manger .search_text').val(obj.mnue_desc);
    //先解除原先点击事件
    $('.address-manger .save').unbind();
    $('.address-manger .save').on('click',function () {
        //判断必填信息是否已经填写
        if(!$('.address-manger .search_text').val()){
            alert('请选择上级菜单');
            return;
        }
        if(!$('.address-manger .mnue_desc').val()){
            alert('请填写菜单名称');
            return;
        }
        //所有验证通过，发送请求进行
        addMnues(obj);
    });
}
//添加子菜单ajax请求
function addMnues(obj) {
    utils.ajaxSend({
        url:'/baixiu/sonAddressAdd',
        type:'post',
        dataType:'json',
        data:{
            id:$('.address-manger .mnue_url').val(),
            oldId:window.sonObj&&window.sonObj.id,
            mnueDesc:$('.address-manger .mnue_desc').val(),
            parentId:window.parentObj.id,
            isUpdate:isUpdate
        }},function (data) {
        console.log(data);
        if(data.status == 0){
            //添加成功
            $('.address-manger table tbody').empty();
            console.log(JSON.stringify(data.returnDate));
            for(var i = 0;i<data.returnDate.length;i++){
                //循环遍历集合元素,添加公司目录。
                utils.addTableMnues($('.address-manger table tbody'),data.returnDate[i],null,0);
            }
            // addMnueList(data.returnDate);
            //跳转到添加子菜单的页面
            $('.address-manger .address-tabs li:first-child').addClass('active');
            $('.address-manger .address-tabs li:last-child').removeClass('active');
            $('.address-manger .address-content div:first-child').addClass('active');
            $('.address-manger .address-content div:last-child').removeClass('active');
            //将返回的集合数据重新渲染到标签中，供后面使用
            // $("#template").html(JSON.stringify(data).replace(/"/g,'&#34;'));
        }else{
            //添加失败
            alert('添加失败！');
        }
        init();
    },function (error) {
        alert('添加失败！');
        init();
    });
}
function mnueTreeInModel() {
    $('.address-manger-tree .address-manger-model').html('');
    utils.ajaxSend({type: 'get',
        url: '/baixiu/queryAddressList',
        data: {},
        dataType: "json"
    },function (result) {
        for(var i = 0;i<result.returnDate.length;i++){
            //循环遍历集合元素,添加公司目录。
            utils.mnueTreeInModel($('.address-manger-tree .address-manger-model'),result.returnDate[i],null,0);
        }
    },function (error) {

    });
   /* for(var i = 0;i<dataJson.dataJsonArr.length;i++){
        //循环遍历集合元素,添加菜单目录。
        utils.mnueTreeInModel($('.address-manger-tree .address-manger-model'),dataJson.dataJsonArr[i],null,0);
    }*/

};
function chooseMnue(obj) {
    window.parentObj = obj;
   // if(isUpdate == 'Y'){
   //     mnueObj = obj;
   //     $('.address-manger .search_text').val(mnueObj.mnue_desc);
   // }else{
   //     window.obj = obj;
   //     $('.address-manger .search_text').val(window.obj.mnue_desc);
   // }
   //  $('.address-manger .search_text').val(mnueObj.mnue_desc);
    $('.address-manger .search_text').val(window.parentObj.mnue_desc);
    $('.address-manger-tree').modal('hide');
}