'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/v3.x/concepts/services.html#core-services)
 * to customize this service
 */

module.exports = {
    spendAmount: async ctx => {
        try {
            let sumData = await strapi.connections.default.raw(`SELECT SUM(amount) FROM budget_tracking_lineitem where budget_targets_project = ${ctx.params.where.budgetTargetsProject}`)
            return sumData.rows && sumData.rows.length > 0 && sumData.rows[0].sum != null ? sumData.rows[0].sum : 0;
        } catch (error) {
            console.log(error)
            return ctx.badRequest(null, error.message);

        }
    },
    totalSpendAmountByProject: async ctx => {
        try {
            console.log( ctx.params.where);
            let budget_targets_projectIds = await strapi.query("budget-targets-project").find({project : ctx.params.where.project});
            let sumData  = 0;
            budget_targets_projectIds = budget_targets_projectIds.map(m => m.id);
            if(budget_targets_projectIds.length > 0){
                budget_targets_projectIds = budget_targets_projectIds.map(x => "'" + x + "'").toString();
                sumData = await strapi.connections.default.raw(`SELECT SUM(amount) FROM budget_tracking_lineitem where budget_targets_project IN (${budget_targets_projectIds})`)
            }
            return sumData.rows && sumData.rows.length > 0 && sumData.rows[0].sum != null ? sumData.rows[0].sum : sumData;
        } catch (error) {
            console.log(error)
            return ctx.badRequest(null, error.message);
        }
    },

};
