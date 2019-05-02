let ejsExcel=require('ejsexcel');
module.exports = {
    readExcel(path,workBookIndex,readSuccess,readErr){
        let exBuf=fs.readFileSync(path);
        ejsExcel.getExcelArr(exBuf).then(exlJson=>{
            let workBook=exlJson;
            let workSheets=workBook[workBookIndex];
            console.log(workSheets.length);
            workSheets.forEach((item,rIndex)=>{
                readSuccess(rIndex,item);

            })
        }).catch(error=>{
            readErr(error);
        });
    }

};