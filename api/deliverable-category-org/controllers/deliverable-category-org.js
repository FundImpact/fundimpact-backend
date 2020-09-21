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
    projectCountDelUnit :  async ctx => {
        try {
            let data = await strapi.connections.default.raw(`select du.id, du.name , count(dtp.project) from deliverable_unit_org du 
            INNER JOIN deliverable_category_unit dcu ON du.id = dcu.deliverable_units_org 
            INNER JOIN deliverable_target_project dtp ON dcu.id = dtp.deliverable_category_unit  where du.id = ${ctx.query.deliverable_unit_org} 
            GROUP BY du.id`)
            return data.rows && data.rows.length > 0 ? data.rows : [];
        } catch (error) {
            console.log(error)
            return ctx.badRequest(null, error.message);
        }
    },
    totalDeliverableByOrg :  async ctx => {
        try {
            let data = await strapi.connections.default.raw(`select count(dtp.project) from deliverable_category_org dco 
            JOIN deliverable_category_unit dcu ON  dco.id = dcu.deliverable_category_org 
            JOIN deliverable_target_project dtp ON dtp.deliverable_category_unit = dcu.id  where organization = ${ctx.query.organization}`)
            return data.rows && data.rows.length > 0 && data.rows[0].count  ? data.rows[0].count : 0;
        } catch (error) {
            console.log(error)
            return ctx.badRequest(null, error.message);
        }
    },
    totalAchivedProjectByOrg :  async ctx => {
        try {
            let data = await strapi.connections.default.raw(`WITH cte AS(select dtp.project ,sum(dtp.target_value) as sum_dtp ,  
            sum(dtl.value) as sum_dtl from deliverable_category_org dco JOIN deliverable_category_unit dcu ON  dco.id = dcu.deliverable_category_org 
            JOIN deliverable_target_project dtp ON dtp.deliverable_category_unit = dcu.id 
            JOIN deliverable_tracking_lineitem dtl ON dtp.id = dtl.deliverable_target_project  
            where organization = ${ctx.query.organization} group by dtp.project) 
            select count(cte.project) from cte where cte.sum_dtp = cte.sum_dtl`)

            return data.rows && data.rows.length > 0 && data.rows[0].count  ? data.rows[0].count : 0;
        } catch (error) {
            console.log(error)
            return ctx.badRequest(null, error.message);
        }
    },
    avgAchivementDeliverableByOrg :  async ctx => {
        try {
            let data = await strapi.connections.default.raw(`WITH cte AS(select sum(dtp.target_value) as sum_dtp ,  
            sum(dtl.value) as sum_dtl from deliverable_category_org dco JOIN deliverable_category_unit dcu ON  dco.id = dcu.deliverable_category_org 
            JOIN deliverable_target_project dtp ON dtp.deliverable_category_unit = dcu.id 
            JOIN deliverable_tracking_lineitem dtl ON dtp.id = dtl.deliverable_target_project  where organization = ${ctx.query.organization}) 
            select ROUND((sum_dtl * 100.0)/ sum_dtp) as avg from cte where cte.sum_dtp <> cte.sum_dtl`)
            return data.rows && data.rows.length > 0 && data.rows[0].avg  ? data.rows[0].avg : 0;
        } catch (error) {
            console.log(error)
            return ctx.badRequest(null, error.message);
        }
    },
    achiveDeliverableVsTargetByOrg :  async ctx => {
        try {
            let data = await strapi.connections.default.raw(`WITH cte AS( select dtp.id ,sum(dtp.target_value) as sum_dtp ,  
            sum(dtl.value) as sum_dtl from deliverable_category_org dco JOIN deliverable_category_unit dcu ON  dco.id = dcu.deliverable_category_org 
            JOIN deliverable_target_project dtp ON dtp.deliverable_category_unit = dcu.id 
            JOIN deliverable_tracking_lineitem dtl ON dtp.id = dtl.deliverable_target_project  
            where organization = ${ctx.query.organization} group by dtp.id) 
            select count(id) from cte where sum_dtp = sum_dtl`)

            return data.rows && data.rows.length > 0 && data.rows[0].count  ? data.rows[0].count : 0;
        } catch (error) {
            console.log(error)
            return ctx.badRequest(null, error.message);
        }
    },
};
