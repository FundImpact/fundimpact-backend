'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/v3.x/concepts/services.html#core-services)
 * to customize this service
 */

module.exports = {
    totalAchivedValue: async ctx => {
        try {
            let deliverableTargetProject = await strapi.query('deliverable-target-project').find({ project: ctx.params.where.project });
            let deliverableTargetProjectId = deliverableTargetProject.map(m => m.id)
            let totalAmt = await strapi.connections.default.raw(`SELECT SUM(value) FROM deliverable_tracking_lineitem where deliverable_target_project IN (${deliverableTargetProjectId})`)
            return totalAmt.rows && totalAmt.rows.length > 0 && totalAmt.rows[0].sum != null ? totalAmt.rows[0].sum : 0;
        } catch (error) {
            console.log(error)
            return ctx.badRequest(null, error.message);

        }
    }
};
