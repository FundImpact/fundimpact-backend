'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/v3.x/concepts/controllers.html#core-controllers)
 * to customize this controller
 */

module.exports = {
    projectCountImpCatByOrg :  async ctx => {
        try {
            let data = await strapi.connections.default.raw(`select ic.id, ic.name ,count(itp.project) from impact_category_org ic INNER JOIN impact_category_unit icu 
            ON ic.id = icu.impact_category_org INNER JOIN impact_target_project itp ON icu.id = itp.impact_category_unit  where ic.id = ${ctx.query.impact_category_org} 
            GROUP BY ic.id`)
            return data.rows && data.rows.length > 0 ? data.rows : [];
        } catch (error) {
            console.log(error)
            return ctx.badRequest(null, error.message);
        }
    },
    projectCountImpUnit :  async ctx => {
        try {
            let data = await strapi.connections.default.raw(`select iu.id, iu.name , count(itp.project) from impact_units_org iu 
            INNER JOIN impact_category_unit icu ON iu.id = icu.impact_units_org 
            INNER JOIN  impact_target_project itp ON icu.id = itp.impact_category_unit  where iu.id = ${ctx.query.impact_unit_org}
            GROUP BY iu.id;`)
            return data.rows && data.rows.length > 0 ? data.rows : [];
        } catch (error) {
            console.log(error)
            return ctx.badRequest(null, error.message);
        }
    }
};
