$(function () {
    $('#downLoad').click(function () {
        var fileName = $('#desc').val()+'人员配置.xlsx';
        downLoadTemplte(fileName);
    });
});
function downLoadTemplte(fileName) {
    var url = "/baixiu/cisTemplateDownLoad";
    // var fileName = "人员收集模板.xls";
    var fileName = fileName;
    var form = $("<form></form>").attr("action", url).attr("method", "post");
    form.append($("<input></input>").attr("type", "hidden").attr("name", "filename").attr("value", fileName));
    form.appendTo('body').submit().remove();
}
function uploadData() {
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
}