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
            let totalAmt = await strapi.connections.default.raw(`
            select SUM(dstli.value) as value from deliverable_target_project dtp 
            left join (SELECT * FROM  deliverable_sub_targets  WHERE deleted=false) as dst ON dtp.id=dst.deliverable_target_project
            left join (SELECT SUM(value) as value, deliverable_sub_target FROM  deliverable_tracking_lineitem WHERE deleted=false group by deliverable_sub_target) as dstli ON dst.id=dstli.deliverable_sub_target
            where type='${ctx.params.where.type}' and dtp.project=${ctx.params.where.project} and dtp.id=${ctx.params.where.deliverable_target_project} and dtp.deleted=false`)
            return totalAmt.rows && totalAmt.rows.length > 0 && totalAmt.rows[0].value !== null ? totalAmt.rows[0].value : 0;
        } catch (error) {
            console.log(error)
            return ctx.badRequest(null, error.message);
        }
    },
    totalAchivedValueTargetValue: async ctx => {
        try {
            let totalAmt = await strapi.connections.default.raw(`
            select SUM(target_value) as target_total,SUM(dstli.value) as achieved_total from deliverable_target_project dtp 
            left join (SELECT * FROM  deliverable_sub_targets  WHERE deleted=false) as dst ON dtp.id=dst.deliverable_target_project
            left join (SELECT SUM(value) as value, deliverable_sub_target FROM  deliverable_tracking_lineitem WHERE deleted=false group by deliverable_sub_target) as dstli ON dst.id=dstli.deliverable_sub_target
            where type='${ctx.params.where.type}' and dtp.project=${ctx.params.where.project} and dtp.deleted=false`)
            return totalAmt.rows && totalAmt.rows.length > 0 ? totalAmt.rows[0] : {};
        } catch (error) {
            console.log(error)
            return ctx.badRequest(null, error.message);
        }
    },

    totalSpendAmountByProject: async ctx => {
        try {
            let deliverable_target_projectIds = await strapi.query("deliverable-target-project").find({ project: ctx.params.where.project, _limit: 1000 });
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
