$(function () {
    $('#downLoad').click(function () {
        var fileName = $('#desc').val()+'人员配置.xlsx';
        downLoadTemplte(fileName);
    });
    $('#upload').click(function () {
        uploadDataByObj({
            'cisdiv':$('#cis_division').val(),
            'desc':$('#desc').val(),
            'templateFile':$("#exampleInputFile")[0].files[0]
        },"/baixiu/getExcel")
    })
});
function downLoadTemplte(fileName) {
    var url = "/baixiu/cisTemplateDownLoad";
    // var fileName = "人员收集模板.xls";
    var fileName = fileName;
    var form = $("<form></form>").attr("action", url).attr("method", "post");
    form.append($("<input></input>").attr("type", "hidden").attr("name", "filename").attr("value", fileName));
    form.appendTo('body').submit().remove();
}
function downLoadFileAsynch() {
    $.ajax({
        url:"/baixiu/cisTemplateDownLoadAsynch",
        type:"post",
        success:function(result){
            var content = this.response;
            var aTag = document.createElement('a');
            var blob = new Blob([content]);
            var headerName = xhr.getResponseHeader("Content-disposition");
            var fileName = decodeURIComponent(headerName).substring(20);
            aTag.download = fileName;
            aTag.href = URL.createObjectURL(blob);
            aTag.click();
            URL.revokeObjectURL(blob);
        }
    })
}
/*function uploadData() {
    var formData = new FormData();//获取form值
    formData.append('cisdiv',$('#cis_division').val());
    formData.append('desc',$('#desc').val());
    formData.append('templateFile', $("#exampleInputFile")[0].files[0]);
    $.ajax({
        url:"/baixiu/getExcel",
        type:"post",
        data: formData,
        processData: false,  // 不处理数据
        contentType:false,  // 不设置内容类型
        success:function(data){
            console.log(data)
        },
        error:function(e){
            alert("错误！！");
        }
    });
}*/
function uploadDataByObj(obj,url) {
    var formData = new FormData();//获取form值
    for(var item in obj){
        formData.append(item,obj[item]);
    }

   /* formData.append('cisdiv',$('#cis_division').val());
    formData.append('desc',$('#desc').val());
    formData.append('templateFile', $("#exampleInputFile")[0].files[0]);*/
    $.ajax({
        url:url,
        type:"post",
        data: formData,
        processData: false,  // 不处理数据
        contentType:false,  // 不设置内容类型
        success:function(data){
            console.log(data)
        },
        error:function(e){
            alert("错误！！");
        }
    });
}