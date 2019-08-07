var returnData = null;
var hiddenList = [];
$(function () {
    utils.renderPage();
    $('#user-search').on('click', function () {
        getUserListData(1, utils.pageSize, $('.email').val(), $('.nick_name').val());
    });

    $('#permission-search').on('click', function () {
        if (!$('#email').val()) {
            alert('请输入账号');
            return;
        }
        getUserPerList();
    });
    $('#permission-update').on('click', function () {
        if (!$('#email').val()) {
            alert('请输入账号');
            return;
        }
        updateUserPermission();
    });
    getUserListData(1, utils.pageSize, $('.email').val(), $('.nick_name').val());
});

function updateUserPermission() {
    var companyArr = [];
    var mnuePerArr = [];
    var dataPerArr = [];
    var containCompany = false;
    var containMnuePer = false;
    var containDataPer = false;
    $('.user_company_list tbody .company_code_view').each(function (index, companyCodeInput) {
        if ($(companyCodeInput).val()) {
            for (var i = 0; i < companyArr.length; i++) {
                if ($(companyCodeInput).val() == companyArr[i]) {
                    containCompany = true;
                    break;
                }
            }
            if (!containCompany)
                companyArr.push($(companyCodeInput).val())
            else
                return false;
        }
    });
    if (containCompany) {
        alert('公司机构重复');
        return;
    }
    $('.user_mnue_permission_list tbody .mnue_per_code_view').each(function (index, mnueCodeInput) {
        if ($(mnueCodeInput).val()) {
            for (var i = 0; i < mnuePerArr.length; i++) {
                if ($(mnueCodeInput).val() == mnuePerArr[i]) {
                    containMnuePer = true;
                    break;
                }
            }
            if (!containMnuePer)
                mnuePerArr.push($(mnueCodeInput).val());
            else
                return false;

        }
    });
    if (containMnuePer) {
        alert('角色权限重复');
        return;
    }
    $('.user_data_permission_list tbody .data_per_code_view').each(function (index, dataCodeInput) {
        if ($(dataCodeInput).val()) {
            for (var i = 0; i < dataPerArr.length; i++) {
                if ($(dataCodeInput).val() == dataPerArr[i]) {
                    containDataPer = true;
                    return;
                }
            }
            if (!containDataPer)
                dataPerArr.push($(dataCodeInput).val());
            else
                return false;
        }
    });
    if (containDataPer) {
        alert('数据权限重复');
        return;
    }
    //校验完毕，发送ajax请求提交数据
    utils.ajaxSend({
        type: 'post',
        url: '/baixiu/updateUserPermission',
        dataType: 'json',
        data: {email:$('#email').val(),companyArr:companyArr.join(','),mnuePerArr:mnuePerArr.join(','),dataPerArr:dataPerArr.join(',')}
    }, function (data) {

    }, function (error) {

    });
}

function renderPerPage(data) {
    var companyHtml = template('companyList', data);
    $('.user_company_list tbody').html(companyHtml);
    var mnuePerHtml = template('mnuePerList', data);
    $('.user_mnue_permission_list tbody').html(mnuePerHtml);
    var dataPerHtml = template('dataPerList', data);
    $('.user_data_permission_list tbody').html(dataPerHtml);
}

function getUserListData(offset, pageSize, email, nickName) {
    utils.ajaxSend({
        type: 'get',
        url: '/baixiu/getUserListData',
        dataType: 'json',
        data: {offset, pageSize, email, nickName}
    }, function (data) {
        var userListHtml = template('userList', data);
        $('#user_list table tbody').html(userListHtml);
        //渲染分页页签
        returnData = data.returnData;
        data.returnData.totalCount = data.totalCount;
        $('.pages-nav').empty();
        if (data.totalCount > 0) {
            utils.pageList(data, $('.pages-nav'), function (currentPage, pageSize) {
                getUserListData(currentPage, pageSize, email, nickName);
            });
        }
    }, function (error) {
        alert('请求出问题');
    });
}

function distriBution(email) {
    $('.permission_distribution .permission-tabs li:first-child').removeClass('active');
    $('.permission_distribution .permission-tabs li:last-child').addClass('active');
    $('.permission_distribution .permission-content div:first-child').removeClass('active');
    $('.permission_distribution .permission-content div:last-child').addClass('active');
    $('#email').val(email);
    if ($('#email').val()) {
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
        if (data.status == 0) {
            renderPerPage(data);
        } else {
            alert(data.desc);
        }
    }, function (error) {

    })
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
};

//点选公司
function chooseMnue(obj) {
    $('.company-manger-tree').modal('hide');
    if (window.chooseCompanyType == 'start') {
        $('.start_company_type_desc_view').val(obj.mnue_desc);
        $('.start_company_type_code_view').val(obj.id);
    } else if (window.chooseCompanyType == 'end') {
        $('.end_company_type_desc_view').val(obj.mnue_desc);
        $('.end_company_type_code_view').val(obj.id);
    }
}

function addPer(obj, type) {
    if (type == 'companyList') {
        var html = template('companyList', {companyJsonArray: null}).trim();
        $(html).insertAfter($(obj).parents('tr'));
    } else if (type == 'mnuePerList') {
        var html = template('mnuePerList', {mnueJsonArray: null}).trim();
        $(html).insertAfter($(obj).parents('tr'));
    } else if (type == 'dataPerList') {
        var html = template('dataPerList', {dataJsonArray: null}).trim();
        $(html).insertAfter($(obj).parents('tr'));
    }
}

function minusPer(obj) {
    $(obj).parents('tr').remove();
}

function companyChoose(obj) {
    window.companyObj = obj;
    $('.company-manger-tree .company-manger-model').html('');
    utils.ajaxSend({
        type: 'get',
        url: '/baixiu/queryCompanyList',
        data: {},
        dataType: "json"
    }, function (result) {
        if (result.status == 0) {
            for (var i = 0; i < result.returnDate.length; i++) {
                //循环遍历集合元素,添加公司目录。
                // utils.addTableMnues(tbody,result.returnDate[i],null,0);
                utils.mnueTreeInModel($('.company-manger-tree .company-manger-model'), result.returnDate[i], null, 0);
            }
            $('#company_tree').modal('show');
        }

    }, function (error) {

    });
}

function toggle(flag, obj, jsonObj) {
    findAllID(obj, jsonObj);
    var isOpen = $(flag + jsonObj.id).attr('data-open');
    if (isOpen == 'on') {
        for (var i = 0; i < hiddenList.length; i++) {
            $(flag + hiddenList[i]).hide();
        }
        $(obj).attr("class", "glyphicon glyphicon-menu-right");
        $(flag + jsonObj.id).attr('data-open', 'off');
    } else {
        for (var i = 0; i < hiddenList.length; i++) {
            // if($('#mnuesManger' + hiddenList[i]).is(':visible')){
            $(flag + hiddenList[i]).show();
            // }
        }
        $(obj).attr("class", "glyphicon glyphicon-menu-down");
        $(flag + jsonObj.id).attr('data-open', 'on');
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

function chooseMnue(obj) {
    if (window.companyObj) {
        var companyInputCode = $(window.companyObj).siblings('.company_code_view');
        companyInputCode.val(obj.id);
        var companyInputDesc = $(window.companyObj).siblings('.company_desc_view');
        companyInputDesc.val(obj.mnue_desc);
    }
    $('.company-manger-tree').modal('hide');
}

function mnuePerChoose(obj) {
    window.mnuePerObj = obj;
    utils.ajaxSend({
        type: 'get',
        url: '/baixiu/searchPermissionTypeList',
        data: {},
        dataType: "json"
    }, function (data) {
        var html = template('permissionList', data);
        $('.permission-list').html(html);
        $('#modal_tree').modal('show');
    }, function (error) {

    });
}


function showInfo(obj) {
    if (window.mnuePerObj) {
        var mnuePerInputDesc = $(window.mnuePerObj).siblings('.mnue_per_desc_view');
        mnuePerInputDesc.val($(obj).html());
        var mnuePerInputCode = $(window.mnuePerObj).siblings('.mnue_per_code_view');
        mnuePerInputCode.val(obj.dataset.permissionCode);
    }
    $('.permission-manger-tree').modal('hide');
}
