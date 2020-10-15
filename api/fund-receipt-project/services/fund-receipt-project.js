'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/v3.x/concepts/services.html#core-services)
 * to customize this service
 */

module.exports = {
    totalRecivedAmt: async ctx => {
        try {
            let sumData = await strapi.connections.default.raw(`
                SELECT SUM(fund_receipt_project.amount) as sum FROM fund_receipt_project 
                INNER JOIN project_donor ON project_donor.id = fund_receipt_project.project_donor
                where project_donor.project = ${ctx.params.where.project}`
            )
            return sumData.rows && sumData.rows.length > 0 && sumData.rows[0].sum != null ? sumData.rows[0].sum : 0;
        } catch (error) {
            console.log("error",error);
            return ctx.badRequest(null, error.message);
        }
    }
};
