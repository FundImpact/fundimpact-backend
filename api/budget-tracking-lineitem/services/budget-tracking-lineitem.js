"use strict";

/**
 * Read the documentation (https://strapi.io/documentation/v3.x/concepts/services.html#core-services)
 * to customize this service
 */

module.exports = {
  spendAmount: async (ctx) => {
    try {
      let sumData = await strapi.connections.default.raw(
        `SELECT SUM(amount) FROM budget_tracking_lineitem where budget_targets_project = ${ctx.params.where.budgetTargetsProject} and COALESCE(deleted, false) <> true`
      );
      return sumData.rows &&
        sumData.rows.length > 0 &&
        sumData.rows[0].sum != null
        ? sumData.rows[0].sum
        : 0;
    } catch (error) {
      console.log(error);
      return ctx.badRequest(null, error.message);
    }
  },
  totalSpendAmountByProject: async (ctx) => {
    try {
      console.log(ctx.params.where);
      let budget_sub_targets_projectIds = await strapi
        .query("budget-sub-target")
        .find({ project: ctx.params.where.project, _limit: 1000 });
      console.log('budget-sub-target',budget_sub_targets_projectIds)  
      let sumData = 0;
      budget_sub_targets_projectIds = budget_sub_targets_projectIds
        .filter((m) => !m.deleted)
        .map((m) => m.id);
      if (budget_sub_targets_projectIds.length > 0) {
        budget_sub_targets_projectIds = budget_sub_targets_projectIds
          .map((x) => "'" + x + "'")
          .toString();
        sumData = await strapi.connections.default.raw(
          `SELECT SUM(amount) FROM budget_tracking_lineitem where budget_sub_target IN (${budget_sub_targets_projectIds}) and COALESCE(budget_tracking_lineitem.deleted, false) <> true`
        );
      }
      return sumData.rows &&
        sumData.rows.length > 0 &&
        sumData.rows[0].sum != null
        ? sumData.rows[0].sum
        : 0;
    } catch (error) {
      console.log(error);
      return ctx.badRequest(null, error.message);
    }
  },
};
