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
    $('#order-amount-modify').on('click', function () {
        if (!$('#order-amount').val()) {
            alert('请输入要修改的金额');
            return;
        }
        modifyAmount();

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
        console.log(html)
        $('.cost_type_list_items').html(html);

    }, function (error) {

    })
}
function showCostInfo(obj) {
    $('#order-amount').val(obj.dataset.amount);
    $('#order-char-id').val(obj.dataset.id);
}

//修改订单金额请求
function modifyAmount() {
    utils.ajaxSend({
        type: 'post',
        url: '/baixiu/modifyAmount',
        dataType: 'json',
        data: {id:$('#order-char-id').val(),amount:$('#order-amount').val()}
    }, function (data) {
        if(data.status == 0) {
            $('.order-manger-tree').modal('hide');
            getOrderAmountList();
        }
    }, function (error) {
        alert(error);
    });
}
