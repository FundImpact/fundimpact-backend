'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/v3.x/concepts/services.html#core-services)
 * to customize this service
 */

module.exports = {
    totalImpactAmount: async ctx => {
        try {
            let sumData = await strapi.connections.default.raw(`SELECT SUM(target_value) FROM impact_target_project where project = (${ctx.params.where.project})`)
            return sumData.rows && sumData.rows.length > 0 && sumData.rows[0].sum != null ? sumData.rows[0].sum : 0;
        } catch (error) {
            console.log(error)
            return ctx.badRequest(null, error.message);
            
        }
    }
};
