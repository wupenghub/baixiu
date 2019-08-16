var mysql = require('mysql');
var PermissionMaintenanceSql = {
    queryCountSql(){
         return  `
                    SELECT
                        count(1) AS count
                    FROM
                        sys_data_permissions_group u
                    WHERE
                        u.del_flag = 0
                  `;
    },
    searchDataPermissionTypeList(offset,pageSize){
       var sql =  `
                    SELECT
                        dg.data_permissions_code AS perCode,
                        dg.data_permissions_desc AS perDesc
                    FROM
                        sys_data_permissions_group dg
                    GROUP BY
                        dg.data_permissions_code,
                        dg.data_permissions_desc
                  `;
        if (offset && pageSize) {
            sql += "LIMIT " + ((offset - 1) * pageSize) + "," + pageSize;
        }
        return sql;
    },
    searchDataPermissionTypeInfo(permissionTypeCode){
        return `
                    SELECT
                        pg.data_permissions_desc AS perDesc
                    FROM
                        sys_data_permissions_group pg
                    WHERE
                        pg.data_permissions_code = ${mysql.escape(permissionTypeCode)}
                    AND pg.del_flag = 0
                `;
    },
    modifyDataPermissionTypeDesc(permissionTypeCode,permissionTypeDesc){
        return `
                    UPDATE sys_data_permissions_group dg
                    SET dg.data_permissions_desc = ${mysql.escape(permissionTypeDesc)}
                    WHERE
                        dg.data_permissions_code = ${mysql.escape(permissionTypeCode)};
                `;
    }
};
module.exports = PermissionMaintenanceSql;