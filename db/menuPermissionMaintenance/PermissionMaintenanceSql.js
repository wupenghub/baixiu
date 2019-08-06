var mysql = require('mysql');
var PermissionMaintenanceSql = {
    searchPermissionTypeList(offset,pageSize){
        var sql = `
                SELECT
                    sg.permissions_code AS perCode,
                    sg.permissions_desc perDesc
                FROM
                    sys_mnue_permissions_group sg
                WHERE
                    sg.del_flag = 0
                `;
        if (offset && pageSize) {
            sql += "LIMIT " + ((offset - 1) * pageSize) + "," + pageSize;
        }
        return sql
    },
    queryCountSql(){
        return `
                SELECT
                    count(1) AS count
                FROM
                    sys_mnue_permissions_group sg
                WHERE
                    sg.del_flag = 0
               `;
    },
    searchPermissionTypeInfo(permissionTypeCode){
        return `
                SELECT
                    sg.permissions_desc AS perDesc
                FROM
                    sys_mnue_permissions_group sg
                WHERE
                    sg.del_flag = 0
                AND sg.permissions_code = ${mysql.escape(permissionTypeCode)}
               `;
    },
    queryCount(permissionTypeCode){
        return `select count(1) as count from sys_mnue_permissions_group sg where sg.permissions_code = ${mysql.escape(permissionTypeCode)}`;
    },
    modifyPermissionTypeDesc(permissionTypeCode,permissionTypeDesc) {
        return `
                UPDATE sys_mnue_permissions_group sg
                SET sg.permissions_desc = ${mysql.escape(permissionTypeDesc)}
                WHERE
                    sg.permissions_code = ${mysql.escape(permissionTypeCode)}
               `;
    },
    addPermissionInfo(permissionTypeCode,permissionTypeDesc){
        return `
                INSERT sys_mnue_permissions_group
                SET permissions_code = ${mysql.escape(permissionTypeCode)},
                 permissions_desc = ${mysql.escape(permissionTypeDesc)}
               `;
    }
};
module.exports = PermissionMaintenanceSql;