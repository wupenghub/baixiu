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
    $('#order-list').on('click', function () {
        $('#order-no').val('');
        $('.cost_type_list_items').html('');
        getOrderListData(1, utils.pageSize);
    });

    $('#order-search').on('click', function () {
        if (!$('#order-no').val()) {
            alert('请输入订单编号');
            return;
        }
        getOrderAmountList();
    });
    //添加出差订单金额按钮点击事件
    $('#add_trip_cost').on('click', function () {
        if (!$('#order-no').val()) {
            alert('请先填写订单号');
            return;
        }
        $('#order_tree').modal('show');
        $('.modal-title').html('添加费用');
        $('.modal-body').empty();
        var html = template('add_amount');
        $('.modal-body').html(html);
        $('.btn-info').on('click',function () {
            $('.order-manger-tree').modal('hide');
        });
        $('#search_cost_standard').on('click', function () {
            addTripCostRequest();
        });
        $('#order-amount-add').on('click', function () {
            if (!$('.line_content .cost_type_desc_view').val() && !$('.line_content .cost_type_code_view').val()) {
                alert('请选择费用类型');
                return;
            }
            if (!$('.amount').val()) {
                alert('请填写金额');
                return;
            }
            addCostAmountRequest();
        });
    });
    //获取订单数据
    getOrderListData(1, utils.pageSize);
});

function getOrderListData(offset, pageSize) {
    var userStr = localStorage.getItem('email');
    var email = '';
    if (userStr) {
        email = JSON.parse(userStr)[0];
    }
    utils.ajaxSend({
        type: 'get',
        url: '/baixiu/getOrderList',
        dataType: 'json',
        data: {offset, pageSize, email}
    }, function (data) {
        var ordersListHtml = template('ordersList', data);
        $('.orders table tbody').html(ordersListHtml);
        //渲染分页页签
        returnData = data.returnData;
        data.returnData.totalCount = data.totalCount;
        utils.pageList(data, $('.pages-nav'), function (currentPage, pageSize) {
            getOrderListData(currentPage, pageSize);
        });
        //注册修改功能点击事件
        $('.order_edit').on('click', function () {
            var orderNo = this.dataset.no;
            $('.orders .order-tabs li:first-child').removeClass('active');
            $('.orders .order-tabs li:last-child').addClass('active');
            $('.orders .order-content div:first-child').removeClass('active');
            $('.orders .order-content div:last-child').addClass('active');
            $('#order-no').val(orderNo);
        });
        //给文章信息绑定删除按钮
        // bindDelete(offset,pageSize);
    }, function (error) {
        alert('请求出问题');
    });
}

function getOrderAmountList() {
    var userStr = localStorage.getItem('email');
    var email = '';
    if (userStr) {
        email = JSON.parse(userStr)[0];
    }
    utils.ajaxSend({
        type: 'get',
        url: '/baixiu/searchOrderCost',
        data: {email, orderNo: $('#order-no').val()},
        dataType: "json"
    }, function (data) {
        console.log('=====' + JSON.stringify(data));
        var html = template('ordersListItems', data);
        $('.cost_type_list_items').html(html);
        $('.type_delete').on('click',function (event) {
            event.stopPropagation();//阻止事件冒泡
            var obj = event.target;
            var id = obj.parentNode.dataset.id;
            deleteOrderAmount(id);
        });

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
