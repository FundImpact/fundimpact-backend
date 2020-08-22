'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/v3.x/concepts/services.html#core-services)
 * to customize this service
 */

module.exports = {
    totalSpendAmount: async ctx => {
        try {
            let sumData = await strapi.connections.default.raw(`SELECT SUM(amount) FROM budget_tracking_lineitem where budget_targets_project = ${ctx.params.where.budgetTargetsProject}`)
            return sumData.rows && sumData.rows.length > 0 && sumData.rows[0].sum != null ? sumData.rows[0].sum : 0;
        } catch (error) {
            console.log(error)
            return ctx.badRequest(null, error.message);

        }
    }
};
