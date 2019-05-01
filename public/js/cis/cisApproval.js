function downLoadTemplte() {
    var url = "/baixiu/cisTemplateDownLoad";
    var fileName = "人员收集模板.xls";
    var form = $("<form></form>").attr("action", url).attr("method", "post");
    form.append($("<input></input>").attr("type", "hidden").attr("name", "filename").attr("value", fileName));
    form.appendTo('body').submit().remove();
}
function uploadData() {
    var formData = new FormData(document.querySelector("#uploadFile"));//获取form值
    $.ajax({
        url:"/baixiu/getExcel",
        type:"post",
        data: formData,
        processData: false,  // 不处理数据
        contentType: false,   // 不设置内容类型
        success:function(data){

        },
        error:function(e){
            alert("错误！！");
        }
    });
}