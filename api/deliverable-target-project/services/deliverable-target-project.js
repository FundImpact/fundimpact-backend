'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/v3.x/concepts/services.html#core-services)
 * to customize this service
 */

module.exports = {
    totalDeliverableAmount: async ctx => {
        try {

            console.log(ctx.params.where.deliverable_target_project.type)
            let sumData = await strapi.connections.default.raw(`SELECT SUM(deliverable_sub_targets.target_value) FROM deliverable_sub_targets 
            INNER JOIN deliverable_target_project on deliverable_target_project.id = deliverable_sub_targets.deliverable_target_project
            where deliverable_sub_targets.project = ${ctx.params.where.project} and deliverable_target_project.type = ${ctx.params.where.deliverable_target_project.type}   and COALESCE(deleted, false) <> true`)
            return sumData.rows && sumData.rows.length > 0 && sumData.rows[0].sum != null ? sumData.rows[0].sum : 0;
        } catch (error) {
            console.log(error)
            return ctx.badRequest(null, error.message);
            
        }
    }
};
