'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/v3.x/concepts/controllers.html#core-controllers)
 * to customize this controller
 */

module.exports = {
    fund_recipet_values : async ctx => {
        try {
            let data = await strapi.connections.default.raw(`select sum(amount) from workspaces ws join projects on ws.id = projects.workspace 
            join project_donor on project_donor.project = projects.id 
            join fund_receipt_project frp on project_donor.id = frp.project_donor  where ws.organization = ${ctx.query.organization}`)
            
            return data.rows && data.rows.length > 0 && data.rows[0].sum != null ? data.rows[0].sum : 0;
        } catch (error) {
            console.log(error)
            return ctx.badRequest(null, error.message);
        }
    }
};
