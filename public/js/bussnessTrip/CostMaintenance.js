var returnData = null;
$(function () {
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
        utils.ajaxSend({
            type: 'get',
            url: '/baixiu/getCostTypeIsByDay',
            data: {
            },
            dataType: "json"
        },function (result) {
            console.log(result)
            if(result.status == 0){
                var fixHtml = template('fixType',result);
                console.log(fixHtml);
                $('.fix_group_add').show();
                $('.fix_cost').html(fixHtml);
            }
        },function (error) {

        });
    });
    $('#cost-type-modify').on('click', function () {
        if (!$('#cost_type_desc_modify').val()) {
            alert('请输入费用类型名称');
            return;
        }
        var costCyc = $("input[type='radio'].fixed:checked").val();
        utils.ajaxSend({
            type: 'get',
            url: '/baixiu/modifyCostTypeMaintenanceInfo',
            data: {
                costTypeCode: $('.cost_type_code_view').val(),
                costTypeDesc:$('#cost_type_desc_modify').val(),
                costCyc
            },
            dataType: "json"
        }, function (data) {
            if(data.status == 0){
                $('.cost_type_desc_view').val($('#cost_type_desc_modify').val());
            }
        }, function (error) {
            alert(error);
        });
    });

    $('.cost-search').on('click', function () {
        if (!$('.cost_type_code_view').val() && !$('.cost_type_desc_view').val()) {
            alert('请输入费用类型');
            return;
        }
        utils.ajaxSend({
            type: 'get',
            url: '/baixiu/searchCostMaintenanceTypeInfo',
            data: {
                costTypeCode: $('.cost_type_code_view').val(),
            },
            dataType: "json"
        }, function (data) {
            console.log(data)
            if (data.status == 0) {
                if(data.returnData.result.length > 0){
                    $('.cost_type_div').show();
                    $('#cost_type_desc_modify').val(data.returnData.result[0].costTypeDesc);
                }else {
                    $('.cost_type_div').hide();
                    $('#cost_type_desc_modify').val('');
                }
                var fixHtml = template('fixType',data.returnData);
                $('.fix_group').html(fixHtml);
                console.log('#is_fix_'+data.returnData.result[0].cost_cyc)
                $('#is_fix_'+data.returnData.result[0].cost_cyc).attr("checked",true);
            } else {

            }
        }, function (error) {

        });
    });

    $('#cost-standard-add').on('click',function () {
        var costType = $('#cost_add .cost_type_code_view').val();//费用类型
        var costTypeDesc = $('#cost_add .company_type_desc_view').val();//费用类型描述
        if(!costType){
            alert('请填写费用类型');
            return;
        }
        if(!costTypeDesc){
            alert('请填写费用描述');
            return;
        }
        utils.ajaxSend({
            type: 'get',
            url: '/baixiu/addCostTypeInfo',
            data: {costType,costTypeDesc,costCyc:$("input[type='radio'].fixed:checked").val()},
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
    $('.fix_cost').html('');
    $('.fix_group').html('');
}
function getCostTypeListData(offset, pageSize) {
    utils.ajaxSend({
        type: 'get',
        url: '/baixiu/searchCostTypeMaintenanceList',
        data: {offset, pageSize},
        dataType: "json"
    }, function (data) {
        var html = template('costsList', data);
        $('.costMaintenance table tbody').html(html);
        $('.cost_type_edit').on('click', function () {
            $('.costMaintenance .cost-tabs li.cost_list_li').removeClass('active');
            $('.costMaintenance .cost-tabs li.cost_add_li').removeClass('active');
            $('.costMaintenance .cost-tabs li.cost_modify_li').addClass('active');
            $('.costMaintenance .cost-content div#cost_list').removeClass('active');
            $('.costMaintenance .cost-content div#cost_add').removeClass('active');
            $('.costMaintenance .cost-content div#cost_modify').addClass('active');
            $('#cost-code').val(this.dataset.code);
            var dataCode = this.dataset.code;
            var costTypeCode = dataCode.split('@')[0];//费用类型对应的code
            var costTypeDesc = dataCode.split('@')[1];//费用类型描述
            $('.cost_type_desc_view').val(costTypeDesc);
            $('.cost_type_code_view').val(costTypeCode);
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
    utils.ajaxSend({
        type: 'get',
        url: '/baixiu/costTypeDelete',
        data: {costTypeCode:dataCode},
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
