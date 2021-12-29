'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/v3.x/concepts/services.html#core-services)
 * to customize this service
 */

module.exports = {
    totalTargetExpense: async ctx => {
        try {
            let sumData = await strapi.connections.default.raw(`
            SELECT SUM(target_value) FROM budget_sub_targets bst
            inner join budget_targets_project btp on btp.id=bst.budget_targets_project
            where bst.project =${ctx.params.where.project} and COALESCE(bst.deleted, false) <> true and COALESCE(btp.deleted, false) <> true`)
            return sumData.rows && sumData.rows.length > 0 && sumData.rows[0].sum != null ? sumData.rows[0].sum : 0;
        } catch (error) {
            return ctx.badRequest(null, error.message);
        }
    }
};
