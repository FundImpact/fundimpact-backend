'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/v3.x/concepts/controllers.html#core-controllers)
 * to customize this controller
 */

module.exports = {
    projectCountDelCatByOrg :  async ctx => {
        try {
            let data = await strapi.connections.default.raw(`select dc.id, dc.name ,count(dtp.project) from deliverable_category_org dc 
            INNER JOIN deliverable_category_unit dcu  ON dc.id = dcu.deliverable_category_org 
            INNER JOIN deliverable_target_project dtp ON dcu.id = dtp.deliverable_category_unit  where dc.id IN (${ctx.query.deliverable_category_org})
            GROUP BY dc.id`)
            return data.rows && data.rows.length > 0 ? data.rows : [];
        } catch (error) {
            console.log(error)
            return ctx.badRequest(null, error.message);
        }
    },
};
