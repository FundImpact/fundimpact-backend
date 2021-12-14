'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/v3.x/concepts/services.html#core-services)
 * to customize this service
 */

module.exports = {
    totalAchivedValue: async ctx => {
        try {
            let totalAmt = await strapi.connections.default.raw(`SELECT SUM(value) FROM deliverable_tracking_lineitem where deliverable_target_project = ${ctx.params.where.deliverableTargetProject} and COALESCE(deleted, false) <> true`)
            return totalAmt.rows && totalAmt.rows.length > 0 && totalAmt.rows[0].sum != null ? totalAmt.rows[0].sum : 0;
        } catch (error) {
            console.log(error)
            return ctx.badRequest(null, error.message);
        }
    },
    totalValue: async ctx => {
        try {
            let totalAmt = await strapi.connections.default.raw(`SELECT SUM(value) as value FROM deliverable_tracking_lineitem dtl
            inner join deliverable_sub_targets dst ON dst.id = dtl.deliverable_sub_target
            where dst.deliverable_target_project=${ctx.params.where.deliverable_target_project} AND dst.project=${ctx.params.where.project} and dtl.deleted=false
            `)
            console.log("totalAmt.rows[0]",totalAmt.rows[0])
            return totalAmt.rows && totalAmt.rows.length > 0 ? totalAmt.rows[0].value : 0;
        } catch (error) {
            console.log(error)
            return ctx.badRequest(null, error.message);
        }
    },
    totalSpendAmountByProject: async ctx => {
        try {
            let deliverable_target_projectIds = await strapi.query("deliverable-target-project").find({ project: ctx.params.where.project, _limit: 1000  });
            let sumData = 0;
            deliverable_target_projectIds = deliverable_target_projectIds.filter(m => !m.deleted).map(m => m.id);
            if (deliverable_target_projectIds.length > 0) {
                deliverable_target_projectIds = deliverable_target_projectIds.map(x => "'" + x + "'").toString();
                sumData = await strapi.connections.default.raw(`SELECT SUM(value) FROM deliverable_tracking_lineitem where deliverable_target_project IN (${deliverable_target_projectIds}) and COALESCE(deleted, false) <> true`)
            }
            return sumData.rows && sumData.rows.length > 0 && sumData.rows[0].sum != null ? sumData.rows[0].sum : 0;
        } catch (error) {
            console.log(error)
            return ctx.badRequest(null, error.message);
        }
    },
};
