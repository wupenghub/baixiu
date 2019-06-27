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
    $('#cost-list').on('click', function () {
       init();
        //获取费用类型数据
        getCompanyTypeListData(1, utils.pageSize);
    });
    $('#cost-modify').on('click',function () {
        init();
    });
    $('#cost-add').on('click',function () {
        init();
    });
    $('#cost-type-modify').on('click', function () {
        if (!$('#cost_type_desc_modify').val()) {
            alert('请输入公司类型名称');
            return;
        }
        utils.ajaxSend({
            type: 'get',
            url: '/baixiu/modifyCompanyTypeMaintenanceInfo',
            data: {
                costTypeCode: $('#cost_modify .company_type_code_view').val(),
                costTypeDesc:$('#cost_type_desc_modify').val()
            },
            dataType: "json"
        }, function (data) {
            if(data.status == 0){
                $('#cost_modify .company_type_desc_view').val($('#cost_type_desc_modify').val());
            }
        }, function (error) {
            alert(error);
        });
    });

    $('.cost-search').on('click', function () {
        if (!$('#cost_modify .company_type_code_view').val() && !$('#cost_modify .company_type_desc_view').val()) {
            alert('请输入公司类型');
            return;
        }
        utils.ajaxSend({
            type: 'get',
            url: '/baixiu/searchCompanyMaintenanceTypeInfo',
            data: {
                costTypeCode: $('#cost_modify .company_type_code_view').val(),
            },
            dataType: "json"
        }, function (data) {
            console.log(data)
            if (data.status == 0) {
                if(data.returnData.length > 0){
                    $('.cost_type_div').show();
                    $('#cost_type_desc_modify').val(data.returnData[0].costTypeDesc);
                }else {
                    $('.cost_type_div').hide();
                    $('#cost_type_desc_modify').val('');
                }

            } else {

            }
        }, function (error) {

        });
    });

    $('#cost-standard-add').on('click',function () {
        var costType = $('#cost_add .cost_type_code_view').val();//费用类型
        var costTypeDesc = $('#cost_add .company_type_desc_view').val();//费用类型描述
        if(!costType){
            alert('请填写公司类型代码');
            return;
        }
        if(!costTypeDesc){
            alert('请填写公司描述');
            return;
        }
        utils.ajaxSend({
            type: 'get',
            url: '/baixiu/addCompanyTypeInfo',
            data: {costType,costTypeDesc},
            dataType: "json"},function (data) {
            if(data.status == 1){
                alert(data.desc);
            }
        },function (error) {
            alert(error);
        });
    });
    //获取公司类型数据getCompanyTypeListData   getCompanyTypeListData
    getCompanyTypeListData(1, utils.pageSize);
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
function getCompanyTypeListData(offset, pageSize) {
    utils.ajaxSend({
        type: 'get',
        url: '/baixiu/searchCompanyTypeMaintenanceList',
        data: {offset, pageSize},
        dataType: "json"
    }, function (data) {
        var html = template('costsList', data);
        $('.companyMaintenance table tbody').html(html);
        $('.cost_type_edit').on('click', function () {
            $('.companyMaintenance .cost-tabs li.cost_list_li').removeClass('active');
            $('.companyMaintenance .cost-tabs li.cost_add_li').removeClass('active');
            $('.companyMaintenance .cost-tabs li.cost_modify_li').addClass('active');
            $('.companyMaintenance .cost-content div#cost_list').removeClass('active');
            $('.companyMaintenance .cost-content div#cost_add').removeClass('active');
            $('.companyMaintenance .cost-content div#cost_modify').addClass('active');
            $('#cost-code').val(this.dataset.code);
            var dataCode = this.dataset.code;
            var costTypeCode = dataCode.split('@')[0];//费用类型对应的code
            var costTypeDesc = dataCode.split('@')[1];//费用类型描述
            $('#cost_modify .company_type_desc_view').val(costTypeDesc);
            $('#cost_modify .company_type_code_view').val(costTypeCode);
        });
        $('.cost_type_delete').on('click',function () {
            var dataCode = this.dataset.code;
            deleteCostStandard(dataCode);
        });
        //渲染分页页签
        returnData = data.returnData;
        data.returnData.totalCount = data.totalCount;
        utils.pageList(data, $('.pages-nav'), function (currentPage, pageSize) {
            getCompanyTypeListData(currentPage, pageSize);
        });
    }, function (error) {

    });
}
function deleteCostStandard(dataCode) {
    utils.ajaxSend({
        type: 'get',
        url: '/baixiu/companyTypeDelete',
        data: {costTypeCode:dataCode},
        dataType: "json"
    },function (data) {
        if(data.status == 0){
            getCompanyTypeListData(1, utils.pageSize);
        }
    },function (error) {

    });
}

function showModal(queryType) {
    $('.model-manger').html('');
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
        $('#cost_modify .cost_type_desc_view').val(obj.innerHTML);
        $('.companyMaintenance .cost_type_code_view').val(obj.dataset.costCode);
    } else if (type == 'GS') {
        $('#cost_modify .company_type_desc_view').val(obj.innerHTML);
        $('#cost_modify .company_type_code_view').val(obj.dataset.costCode);
    } else if (type == 'ZJ') {
        $('.companyMaintenance .level_desc_view').val(obj.innerHTML);
        $('.companyMaintenance .level_code_view').val(obj.dataset.costCode);
    }
    $('.companyMaintenance .cost-manger-tree').modal('hide');
}
