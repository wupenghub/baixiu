var hiddenList = [];
var isUpdate = 'N';
$(function () {
    var data = $("#template").html().replace(/&#34;/g,'"');
    var dataJson = JSON.parse(data);
    var rootNode = $('.aside .nav');
    var tbody = $('.company-manger table tbody');
    $('.avatar').prop('src',dataJson.user.avatar);
    $('.name').html(dataJson.user.nickname);
    for(var i = 0;i<dataJson.dataJsonArr.length;i++){
        //循环遍历集合元素,添加菜单目录。
        utils.addMnues(rootNode,dataJson.dataJsonArr[i]);
    }
    $('.company-manger .save').on('click',function () {
        //判断必填信息是否已经填写
        if(!$('.company-manger .search_text').val()){
            alert('请选择上级菜单');
            return;
        }
        if(!$('.company-manger .mnue_desc').val()){
            alert('请填写菜单名称');
            return;
        }
        //所有验证通过，发送请求进行
        addMnues(window.obj);
    });
    $('.company-manger .back').on('click',function () {
        $('.company-manger .company-tabs li:first-child').addClass('active');
        $('.company-manger .company-tabs li:last-child').removeClass('active');
        $('.company-manger .company-content div:first-child').addClass('active');
        $('.company-manger .company-content div:last-child').removeClass('active');
        init();
    });
    $('#company-add').off('click').on('click',function () {
        isUpdate = 'N';
    });
    $('#company-list').off('click').on('click',function () {
        init();
    });
    //通过发送请求获取公司列表
    utils.ajaxSend({type: 'get',
        url: '/baixiu/queryCompanyList',
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
    $('.company-manger .mnue_desc').val('');
    $('.company-manger .mnue_url').val('');
    $('.company-manger .search_text').val('');
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
    // window.obj = obj;
    window.sonObj = obj;
    $('.company-manger .company-tabs li:first-child').removeClass('active');
    $('.company-manger .company-tabs li:last-child').addClass('active');
    $('.company-manger .company-content div:first-child').removeClass('active');
    $('.company-manger .company-content div:last-child').addClass('active');
    //将点击链接的节点信息描述设置到文本框中
    $('.company-manger .mnue_desc').val(obj.mnue_desc);
    $('.company-manger .mnue_url').val(obj.id);
    // utils.findParentBySon(JSON.parse($("#template").html().replace(/&#34;/g,'"')).dataJsonArr,obj);
    utils.findParentBySon(window.returnDate,obj);
    $('.company-manger .search_text').val(utils.parentObj?utils.parentObj.mnue_desc:'');
    // mnueObj = utils.parentObj;
    window.parentObj = utils.parentObj;
    $('.company-manger .save').unbind();
    $('.company-manger .save').on('click',function () {
        //判断必填信息是否已经填写
        if(!$('.company-manger .search_text').val()){
            alert('请选择上级公司');
            return;
        }
        if(!$('.company-manger .mnue_desc').val()){
            alert('请填写公司名称');
            return;
        }
        if(!$('.company-manger .mnue_url').val()){
            alert('请填写公司代码');
            return;
        }
        //所有验证通过，发送请求进行
        addMnues(obj);
    });

}
//删除菜单点击事件
function mnueDelete(obj) {
    var id = obj.id;
    utils.ajaxSend({type:'get',
        url:'/baixiu/companyDelete',
        data:{id},
        dataType:'json'},
        function (result) {
            // 删除成功，重新绚烂菜单节点
            console.log(result)
            if(result.status == 1){
                alert(result.desc);
            }else {
                $('.company-manger table tbody').empty();
                for(var i = 0;i<result.returnData.length;i++){
                    //循环遍历集合元素,添加公司目录。
                    utils.addTableMnues($('.company-manger table tbody'),result.returnData[i],null,0);
                }
            }
        },function (error) {

        });
}
//添加菜单节点事件，在增删改之后调用
function addMnueList(array) {
    var rootNode = $('.aside .nav');
    var tbody = $('.company-manger table tbody');
    rootNode.html('');
    tbody.html('');
    for (var i = 0; i < array.length; i++) {
        //循环遍历集合元素,添加菜单目录。
        utils.addMnues(rootNode,array[i]);
        utils.addTableMnues(tbody, array[i], null, 0);
        utils.mnueTreeInModel($('.company-manger-tree .company-manger-model'), array[i], null, 0);
    }
}
//添加子菜单点击事件
function sonMnueAdd(obj) {
    isUpdate = 'N';
    // window.obj = obj;
    window.parentObj = obj;
    //跳转到添加子菜单的页面
    $('.company-manger .company-tabs li:first-child').removeClass('active');
    $('.company-manger .company-tabs li:last-child').addClass('active');
    $('.company-manger .company-content div:first-child').removeClass('active');
    $('.company-manger .company-content div:last-child').addClass('active');
    //将点击链接的节点信息描述设置到文本框中
    $('.company-manger .search_text').val(obj.mnue_desc);
    //先解除原先点击事件
    $('.company-manger .save').unbind();
    $('.company-manger .save').on('click',function () {
        //判断必填信息是否已经填写
        if(!$('.company-manger .search_text').val()){
            alert('请选择上级菜单');
            return;
        }
        if(!$('.company-manger .mnue_desc').val()){
            alert('请填写菜单名称');
            return;
        }
        //所有验证通过，发送请求进行
        addMnues(obj);
    });
}
//添加子菜单ajax请求
function addMnues(obj) {
    /*if(!obj){
        alert('无法获取到父节点！');
        return;
    }
    if(mnueObj && isUpdate == 'N'){
        obj = mnueObj;
    }*/
    $.ajax({
        url:'/baixiu/sonCompanyAdd',
        type:'post',
        dataType:'json',
        data:{
            id:$('.company-manger .mnue_url').val(),
            oldId:window.sonObj&&window.sonObj.id,
            mnueDesc:$('.company-manger .mnue_desc').val(),
            parentId:window.parentObj.id,
            isUpdate:isUpdate
        },
        success:function (data) {
            console.log(data);
            if(data.status == 0){
                //添加成功
                $('.company-manger table tbody').empty();
                console.log(JSON.stringify(data.returnDate));
                for(var i = 0;i<data.returnDate.length;i++){
                    //循环遍历集合元素,添加公司目录。
                    utils.addTableMnues($('.company-manger table tbody'),data.returnDate[i],null,0);
                }
                // addMnueList(data.returnDate);
                //跳转到添加子菜单的页面
                $('.company-manger .company-tabs li:first-child').addClass('active');
                $('.company-manger .company-tabs li:last-child').removeClass('active');
                $('.company-manger .company-content div:first-child').addClass('active');
                $('.company-manger .company-content div:last-child').removeClass('active');
                //将返回的集合数据重新渲染到标签中，供后面使用
                // $("#template").html(JSON.stringify(data).replace(/"/g,'&#34;'));
            }else{
                //添加失败
                alert('添加失败！');
            }
            init();
        },
        error:function () {
            alert('出现异常！');
            init();
        }
    })
}
function mnueTreeInModel() {
    $('.company-manger-tree .company-manger-model').html('');
    utils.ajaxSend({type: 'get',
        url: '/baixiu/queryCompanyList',
        data: {},
        dataType: "json"
    },function (result) {
        for(var i = 0;i<result.returnDate.length;i++){
            //循环遍历集合元素,添加公司目录。
            // utils.addTableMnues(tbody,result.returnDate[i],null,0);
            utils.mnueTreeInModel($('.company-manger-tree .company-manger-model'),result.returnDate[i],null,0);
        }
    },function (error) {

    });
   /* for(var i = 0;i<dataJson.dataJsonArr.length;i++){
        //循环遍历集合元素,添加菜单目录。
        utils.mnueTreeInModel($('.company-manger-tree .company-manger-model'),dataJson.dataJsonArr[i],null,0);
    }*/

};
function chooseMnue(obj) {
    window.parentObj = obj;
   // if(isUpdate == 'Y'){
   //     mnueObj = obj;
   //     $('.company-manger .search_text').val(mnueObj.mnue_desc);
   // }else{
   //     window.obj = obj;
   //     $('.company-manger .search_text').val(window.obj.mnue_desc);
   // }
   //  $('.company-manger .search_text').val(mnueObj.mnue_desc);
    $('.company-manger .search_text').val(window.parentObj.mnue_desc);
    $('.company-manger-tree').modal('hide');
}