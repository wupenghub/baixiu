var mysql = require('mysql');
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
    },
    getMnueListSql(){
        return `select * from mnues m where m.del_flag = 0`;
    },
    deleteMnueSqlById(){
        return "delete from sys_mnue_permissions_approval where permissions_code=?";
    },
    insertMnueSqlById(){
        return "insert sys_mnue_permissions_approval  set permissions_code = ?,mnue_id = ?";
    },
    queryPremissionList(){
        return `
                SELECT
                    s.permissions_code AS permissionsCode,
                    s.permissions_desc AS permissionsDesc
                FROM
                    sys_mnue_permissions_group s
               `;
    },
    queryMnuesByPermission(permissionCode){
        return `
                SELECT
                    s.mnue_id AS mnueId,
                    s.permissions_code AS permissionsCode
                FROM
                    sys_mnue_permissions_approval s
                WHERE
                    s.permissions_code = ${mysql.escape(permissionCode)}
               `;
    }
};
module.exports = MnuePerSql;