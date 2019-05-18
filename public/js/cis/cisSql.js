$(function () {
    $('#downLoadSql').click(function () {

    });
    $('#uploadSql').click(function () {
        console.log($("#sqiFile")[0].files[0]);
        uploadDataByObj({
            'cisDiv':$('#cis_division').val(),
            'templateFile':$("#sqiFile")[0].files[0]
        },'/baixiu/sqlExcel');
    })
});
