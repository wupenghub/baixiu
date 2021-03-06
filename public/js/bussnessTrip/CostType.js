var returnData = null;
$(function () {
    /*var data = $("#template").html().replace(/&#34;/g, '"');
    var dataJson = JSON.parse(data);
    var rootNode = $('.aside .nav');
    $('.avatar').prop('src', dataJson.user.avatar);
    $('.name').html(dataJson.user.nickname);
    for (var i = 0; i < dataJson.dataJsonArr.length; i++) {
        //循环遍历集合元素,添加菜单目录。
        utils.addMnues(rootNode, dataJson.dataJsonArr[i]);
    }*/
    utils.renderPage();
    $('#cost-list').on('click', function () {
       init();
        //获取费用类型数据
        getCostTypeListData(1, utils.pageSize);
    });
    $('#cost-modify').on('click',function () {
        init();
    });
    $('#cost-add').on('click',function () {
        init();
    });
    $('#cost-type-modify').on('click', function () {
        if (!$('#cost_type_desc_modify').val()) {
            alert('请输入费用类型名称');
            return;
        }
        if (!$('#cost_type_max_count_modify').val()) {
            alert('请输入上限金额');
            return;
        }
        utils.ajaxSend({
            type: 'get',
            url: '/baixiu/modifyCostTypeInfo',
            data: {
                companyType: $('.company_type_code_view').val(),
                costTypeCode: $('.cost_type_code_view').val(),
                levelCode: $('.level_code_view').val(),
                costTypeDesc: $('#cost_type_desc_modify').val(),
                costMaxAmount: $('#cost_type_max_count_modify').val()
            },
            dataType: "json"
        }, function (data) {
            $('.cost_type_desc_view').val($('#cost_type_desc_modify').val());
        }, function (error) {
            alert(error);
        });
    });

    $('.cost-search').on('click', function () {
        if (!$('.cost_type_code_view').val() && !$('.cost_type_desc_view').val()) {
            alert('请输入费用类型');
            return;
        }
        if (!$('.company_type_desc_view').val() && !$('.company_type_code_view').val()) {
            alert('请输入公司类型');
            return;
        }
        if (!$('.level_desc_view').val() && !$('.level_code_view').val()) {
            alert('请输入职级');
            return;
        }
        utils.ajaxSend({
            type: 'get',
            url: '/baixiu/searchCostTypeInfo',
            data: {
                companyType: $('.company_type_code_view').val(),
                costTypeCode: $('.cost_type_code_view').val(),
                levelCode: $('.level_code_view').val()
            },
            dataType: "json"
        }, function (data) {
            console.log(data)
            if (data.status == 0) {
                if(data.returnData.length > 0){
                    $('.cost_type_div').show();
                    $('#cost_type_desc_modify').val(data.returnData[0].costDesc);
                    $('#cost_type_max_count_modify').val(data.returnData[0].ceilCost);
                }else {
                    $('.cost_type_div').hide();
                    $('#cost_type_desc_modify').val('');
                    $('#cost_type_max_count_modify').val('');
                }

            } else {

            }
        }, function (error) {

        });
    });

    $('#cost-standard-add').on('click',function () {
        var costType = $('.cost_type_code_view').val();//费用类型
        var companyType = $('.company_type_code_view').val();//公司类型
        var levelType = $('.level_code_view').val();//职级类型
        var maxAmount = $('.max_amount_view').val();//金额上限
        if(!costType){
            alert('请填写费用类型');
            return;
        }
        if(!companyType){
            alert('请填写公司类型');
            return;
        }
        if(!levelType){
            alert('请填写职级类型');
            return;
        }
        if(!maxAmount){
            alert('请填写上限金额');
            return;
        }
        utils.ajaxSend({
            type: 'get',
            url: '/baixiu/addCostStandardInfo',
            data: {costType,companyType,levelType,maxAmount},
            dataType: "json"},function (data) {
            if(data.status == 1){
                alert(data.desc);
            }
        },function (error) {
            alert(error);
        });
    });
    //获取费用类型数据
    getCostTypeListData(1, utils.pageSize);
});
function init() {
    $('.cost_type_desc_view').val('');
    $('.cost_type_code_view').val('');
    $('.company_type_desc_view').val('');
    $('.company_type_code_view').val('');
    $('.level_desc_view').val('');
    $('.level_code_view').val('');
    $('#cost_type_desc_modify').val('');
    $('#cost_type_max_count_modify').val('');
    $('.max_amount_view').val('');
    $('.cost_type_div').hide();
}
function getCostTypeListData(offset, pageSize) {
    utils.ajaxSend({
        type: 'get',
        url: '/baixiu/searchCostTypeList',
        data: {offset, pageSize},
        dataType: "json"
    }, function (data) {
        var html = template('costsList', data);
        $('.cost table tbody').html(html);
        $('.cost_type_edit').on('click', function () {
            $('.cost .cost-tabs li.cost_list_li').removeClass('active');
            $('.cost .cost-tabs li.cost_add_li').removeClass('active');
            $('.cost .cost-tabs li.cost_modify_li').addClass('active');
            $('.cost .cost-content div#cost_list').removeClass('active');
            $('.cost .cost-content div#cost_add').removeClass('active');
            $('.cost .cost-content div#cost_modify').addClass('active');
            $('#cost-code').val(this.dataset.code);
            var dataCode = this.dataset.code;
            var dataDesc = this.dataset.desc;
            var costTypeCode = dataCode.split('@')[0];//费用类型对应的code
            var costTypeDesc = dataDesc.split('@')[0];//费用类型描述
            var companyTypeCode = dataCode.split('@')[1];//公司类型对应的code
            var companyTypeDesc = dataDesc.split('@')[1];//公司类型对应的描述
            var levelTypeCode = dataCode.split('@')[2];//费用类型对应的code
            var levelTypeDesc = dataDesc.split('@')[2];//费用类型对应的描述
            $('.cost_type_desc_view').val(costTypeDesc);
            $('.cost_type_code_view').val(costTypeCode);
            $('.company_type_desc_view').val(companyTypeDesc);
            $('.company_type_code_view').val(companyTypeCode);
            $('.level_desc_view').val(levelTypeDesc);
            $('.level_code_view').val(levelTypeCode);
        });
        $('.cost_type_delete').on('click',function () {
            var dataCode = this.dataset.code;
            deleteCostStandard(dataCode);
        });
        //渲染分页页签
        returnData = data.returnData;
        data.returnData.totalCount = data.totalCount;
        utils.pageList(data, $('.pages-nav'), function (currentPage, pageSize) {
            getCostTypeListData(currentPage, pageSize);
        });
    }, function (error) {

    });
}
function deleteCostStandard(dataCode) {
    var costTypeCode = dataCode.split('@')[0];//费用类型对应的code
    var companyTypeCode = dataCode.split('@')[1];//公司类型对应的code
    var levelTypeCode = dataCode.split('@')[2];//费用类型对应的code
    utils.ajaxSend({
        type: 'get',
        url: '/baixiu/costStandardDelete',
        data: {costTypeCode,companyTypeCode,levelTypeCode},
        dataType: "json"
    },function (data) {
        if(data.status == 0){
            getCostTypeListData(1, utils.pageSize);
        }
    },function (error) {

    });
}

function showModal(queryType) {
    $('.type-list').html('');
    if (queryType == 'FY') {
        $('.modal-title').html('费用类型列表');
    } else if (queryType == 'GS') {
        $('.modal-title').html('公司类型列表');
    } else if (queryType == 'ZJ') {
        $('.modal-title').html('职级类型列表');
    }
    utils.ajaxSend({
        type: 'get',
        url: '/baixiu/searchType',
        data: {queryType},
        dataType: "json"
    }, function (data) {
        console.log(data)
        var html = template('typeList',data);
        $('.type-list').html(html);
    }, function (error) {

    });
}

function showInfo(type,obj) {
    if (type == 'FY') {
        $('.cost_type_desc_view').val(obj.innerHTML);
        $('.cost_type_code_view').val(obj.dataset.costCode);
    } else if (type == 'GS') {
        $('.company_type_desc_view').val(obj.innerHTML);
        $('.company_type_code_view').val(obj.dataset.costCode);
    } else if (type == 'ZJ') {
        $('.level_desc_view').val(obj.innerHTML);
        $('.level_code_view').val(obj.dataset.costCode);
    }
    $('.cost-manger-tree').modal('hide');
}
