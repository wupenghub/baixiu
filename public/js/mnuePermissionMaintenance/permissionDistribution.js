var returnData = null;
$(function () {
    utils.renderPage();
    $('#user-search').on('click', function () {
        getUserListData(1, utils.pageSize,$('.email').val(),$('.nick_name').val());
    });

    $('#permission-search').on('click', function () {
        if (!$('#email').val()) {
            alert('请输入账号');
            return;
        }
        getUserPerList();
    });
    getUserListData(1, utils.pageSize,$('.email').val(),$('.nick_name').val());
});
function renderPerPage(data) {
    var companyHtml = template('companyList',data);
    $('.user_company_list tbody').html(companyHtml);
    var mnuePerHtml = template('mnuePerList',data);
    $('.user_mnue_permission_list tbody').html(mnuePerHtml);
    var dataPerHtml = template('dataPerList',data);
    $('.user_data_permission_list tbody').html(dataPerHtml);
}
function getUserListData(offset, pageSize,email,nickName) {
    utils.ajaxSend({
        type: 'get',
        url: '/baixiu/getUserListData',
        dataType: 'json',
        data: {offset, pageSize, email,nickName}
    }, function (data) {
        var userListHtml = template('userList', data);
        $('#user_list table tbody').html(userListHtml);
        //渲染分页页签
        returnData = data.returnData;
        data.returnData.totalCount = data.totalCount;
        $('.pages-nav').empty();
        if(data.totalCount > 0) {
            utils.pageList(data, $('.pages-nav'), function (currentPage, pageSize) {
                getUserListData(currentPage, pageSize, email,nickName);
            });
        }
    }, function (error) {
        alert('请求出问题');
    });
}
function distriBution(email){
    $('.permission_distribution .permission-tabs li:first-child').removeClass('active');
    $('.permission_distribution .permission-tabs li:last-child').addClass('active');
    $('.permission_distribution .permission-content div:first-child').removeClass('active');
    $('.permission_distribution .permission-content div:last-child').addClass('active');
    $('#email').val(email);
    if($('#email').val()){
        getUserPerList();
    }
}
function getUserPerList() {
    var email = $('#email').val();
    utils.ajaxSend({
        type: 'get',
        url: '/baixiu/searchUserPerList',
        data: {email},
        dataType: "json"
    }, function (data) {
        if(data.status==0) {
            renderPerPage(data);
        }else{
            alert(data.desc);
        }
    }, function (error) {

    })
}

function showCostInfo(obj) {
    var html = template('modify_amount');
    $('.modal-title').html('订单费用修改');
    $('.modal-body').empty();
    $('.modal-body').html(html);
    $('#order-amount').val(obj.dataset.amount);
    $('#order-char-id').val(obj.dataset.id);
    $('#order-amount-modify').on('click', function () {
        if (!$('#order-amount').val()) {
            alert('请输入要修改的金额');
            return;
        }
        modifyAmount();
    });
}

//修改订单金额请求
function modifyAmount() {
    utils.ajaxSend({
        type: 'post',
        url: '/baixiu/modifyAmount',
        dataType: 'json',
        data: {id: $('#order-char-id').val(), amount: $('#order-amount').val()}
    }, function (data) {
        if (data.status == 0) {
            $('.order-manger-tree').modal('hide');
            getOrderAmountList();
        }
    }, function (error) {
        alert(error);
    });
}

//添加出差订单金额请求
function addTripCostRequest() {
    $('.type-list').empty();
    var userStr = localStorage.getItem('email');
    var email = '';
    if (userStr) {
        email = JSON.parse(userStr)[0];
    }
    utils.ajaxSend({
        type: 'get',
        url: '/baixiu/searchCostStandard',
        data: {email, orderNo: $('#order-no').val()},
        dataType: "json"
    }, function (result) {
        var html = template('typeList', result);
        $('.type-list').html(html);
        // $('#order-amount-add').on('click',function () {
        //     if(!$('.line_content .cost_type_desc_view').val()&&!$('.line_content .cost_type_code_view').val(code)){
        //         alert('请选择费用类型');
        //         return;
        //     }
        //     if(!$('.amount').val()){
        //         alert('请填写金额');
        //         return;
        //     }
        // });
    }, function (error) {

    });
}

//选择费用类型
function chooseCostType(obj) {
    var code = obj.dataset.costCode;
    var desc = obj.innerHTML;
    $('.line_content .cost_type_desc_view').val(desc);
    $('.line_content .cost_type_code_view').val(code);
    $('#cost_tree').modal('hide');
}
//选择订单状态类型
function chooseOrderStatusType(obj){
    var code = obj.dataset.costCode;
    var desc = obj.innerHTML;
    $('.search_text_div_model .order_status_desc').val(desc);
    $('.search_text_div_model .order_status_code').val(code);
    $('#order_status_tree').modal('hide');
}
//添加费用类型请求
function addCostAmountRequest() {
    var orderNo = $('#order-no').val();
    var costType = $('.line_content .cost_type_code_view').val();
    var amount = $('.amount').val();
    utils.ajaxSend({
        type: 'post',
        url: '/baixiu/addOrderAmount',
        dataType: 'json',
        data: {orderNo, costType, amount}
    }, function (data) {
        if(data.status == 0){
            $('#order_tree').modal('hide');
            getOrderAmountList();
        }
    }, function (error) {

    });
}
//删除订单金额的请求
function deleteOrderAmount(id) {
    utils.ajaxSend({
        type: 'post',
        url: '/baixiu/deleteOrderAmount',
        dataType: 'json',
        data: {id}
    }, function (data) {
        if(data.status == 0){
            getOrderAmountList();
        }
    }, function (error) {

    });
}
//选择公司
function companyChoose(type) {
    $('.company-manger-tree .company-manger-model').html('');
    window.chooseCompanyType = type;
    utils.ajaxSend({
        type: 'get',
        url: '/baixiu/queryCompanyList',
        data: {},
        dataType: "json"
    }, function (result) {
        for (var i = 0; i < result.returnDate.length; i++) {
            //循环遍历集合元素,添加公司目录。
            // utils.addTableMnues(tbody,result.returnDate[i],null,0);
            utils.mnueTreeInModel($('.company-manger-tree .company-manger-model'), result.returnDate[i], null, 0);
            $('#company_tree').modal('show');
        }
    }, function (error) {

    });
    /* for(var i = 0;i<dataJson.dataJsonArr.length;i++){
         //循环遍历集合元素,添加菜单目录。
         utils.mnueTreeInModel($('.company-manger-tree .company-manger-model'),dataJson.dataJsonArr[i],null,0);
     }*/

};
//点选公司
function chooseMnue(obj) {
    $('.company-manger-tree').modal('hide');
    if(window.chooseCompanyType == 'start'){
        $('.start_company_type_desc_view').val(obj.mnue_desc);
        $('.start_company_type_code_view').val(obj.id);
    }else if(window.chooseCompanyType == 'end'){
        $('.end_company_type_desc_view').val(obj.mnue_desc);
        $('.end_company_type_code_view').val(obj.id);
    }
}

function addPer(obj,type) {
    if(type == 'companyList') {
        var html = template('companyList', {companyJsonArray: null}).trim();
        $(html).insertAfter($(obj).parents('tr'));
    }else if(type == 'mnuePerList'){
        var html = template('mnuePerList', {mnueJsonArray: null}).trim();
        $(html).insertAfter($(obj).parents('tr'));
    }else if(type == 'dataPerList'){
        var html = template('dataPerList', {dataJsonArray: null}).trim();
        $(html).insertAfter($(obj).parents('tr'));
    }
}
function minusPer(obj) {
    $(obj).parents('tr').remove();
}


