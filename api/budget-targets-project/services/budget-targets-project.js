'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/v3.x/concepts/services.html#core-services)
 * to customize this service
 */

module.exports = {
    totalTargetExpense: async ctx => {
        try {
            let sumData = await strapi.connections.default.raw(`SELECT SUM(target_value) FROM budget_sub_targets where project = ${ctx.params.where.project} and COALESCE(budget_sub_targets.deleted, false) <> true`)
            return sumData.rows && sumData.rows.length > 0 && sumData.rows[0].sum != null ? sumData.rows[0].sum : 0;
        } catch (error) {
            return ctx.badRequest(null, error.message);
        }
    }
};
