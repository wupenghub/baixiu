var MnuePerSql = {
    searchMnuePremissionListSql(offset,pageSize){
        var sql = `
                SELECT
                    sg.permissions_code,
                    sg.permissions_desc
                FROM
                    sys_mnue_permissions_group sg
                WHERE
                    sg.del_flag = 0
               `;
        if (offset && pageSize) {
            sql += `LIMIT  ${((offset - 1) * pageSize)},${pageSize}`;
        }
        return sql
    },
    searchMnuePremissionListCountSql(){
        var sql = `
                SELECT
                    count(1) as count
                FROM
                    sys_mnue_permissions_group sg
                WHERE
                    sg.del_flag = 0
               `;
        return sql;
    }
};
module.exports = MnuePerSql;