'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/v3.x/concepts/services.html#core-services)
 * to customize this service
 */

module.exports = {
    totalAchivedValue: async ctx => {
        try {
            let totalAmt = await strapi.connections.default.raw(`SELECT SUM(value) FROM deliverable_tracking_lineitem where deliverable_target_project = ${ctx.params.where.deliverableTargetProject}`)
            return totalAmt.rows && totalAmt.rows.length > 0 && totalAmt.rows[0].sum != null ? totalAmt.rows[0].sum : 0;
        } catch (error) {
            console.log(error)
            return ctx.badRequest(null, error.message);
        }
    },
    totalSpendAmountByProject: async ctx => {
        try {
            let deliverable_target_projectIds = await strapi.query("deliverable-target-project").find({ project: ctx.params.where.project });
            let sumData = 0;
            deliverable_target_projectIds = deliverable_target_projectIds.map(m => m.id);
            if (deliverable_target_projectIds.length > 0) {
                deliverable_target_projectIds = deliverable_target_projectIds.map(x => "'" + x + "'").toString();
                sumData = await strapi.connections.default.raw(`SELECT SUM(value) FROM deliverable_tracking_lineitem where deliverable_target_project IN (${deliverable_target_projectIds})`)
            }
            return sumData.rows && sumData.rows.length > 0 && sumData.rows[0].sum != null ? sumData.rows[0].sum : 0;
        } catch (error) {
            console.log(error)
            return ctx.badRequest(null, error.message);
        }
    },
};
