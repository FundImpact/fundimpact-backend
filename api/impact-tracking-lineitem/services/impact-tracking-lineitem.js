'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/v3.x/concepts/services.html#core-services)
 * to customize this service
 */

module.exports = {
    totalAchivedValue: async ctx => {
        try {
            let totalAmt = await strapi.connections.default.raw(`SELECT SUM(value) FROM impact_tracking_lineitem where impact_target_project = ${ctx.params.where.impactTargetProject}`)
           return totalAmt.rows && totalAmt.rows.length > 0 && totalAmt.rows[0].sum != null ? totalAmt.rows[0].sum : 0;
        } catch (error) {
            console.log(error)
            return ctx.badRequest(null, error.message);
        }
    },
    totalSpendAmountByProject: async ctx => {
        try {
            let impact_target_projectIds = await strapi.query("impact-target-project").find({ project: ctx.params.where.project });
            let sumData = 0;
            if (impact_target_projectIds.length > 0) {
                let ids = impact_target_projectIds.map(x => x.id).join();
                let data = await strapi.connections.default.raw(`SELECT SUM(value) FROM impact_tracking_lineitem where impact_target_project IN (${ids})`)
                sumData = data && data.rows && data.rows.length && data.rows[0].sum ? data.rows[0].sum : 0;
            }
            return sumData;
        } catch (error) {
            console.log(error)
            return ctx.badRequest(null, error.message);
        }
    },
};
