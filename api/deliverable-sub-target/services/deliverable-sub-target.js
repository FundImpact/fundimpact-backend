'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/v3.x/concepts/services.html#core-services)
 * to customize this service
 */

module.exports = {

    DeliverableSubTargetsConnection: async ctx => {
        try {
            let sumData = await strapi.connections.default.raw(`SELECT SUM(target_value),count(id) FROM deliverable_sub_targets 
                where COALESCE(deleted, false) <> true`)

            if(sumData.rows && sumData.rows.length > 0){
                let obj = {
                    "deliverableSubTargetsConnection":{ 
                        "aggregate":{
                        "sum": {
                        "target_value":sumData.rows[0].sum != null ? sumData.rows[0].sum:0
                        },
                        "count": sumData.rows[0].count != null ? sumData.rows[0].count:0
                        }
                    }    
                }
                return obj
            }
            return 0     
        } catch (error) {
            console.log(error)
            return ctx.badRequest(null, error.message);
            
        }
    },


};
