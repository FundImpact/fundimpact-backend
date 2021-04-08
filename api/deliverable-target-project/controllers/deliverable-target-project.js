'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/v3.x/concepts/controllers.html#core-controllers)
 * to customize this controller
 */

const {exportTableAsCsv} = require('../../../services/exportTable')

module.exports = {
    deliverable_achieved : async ctx => {
        try {
            let data = await strapi.connections.default.raw(`WITH cte AS (select projects.id , projects.name ,sum(dtp.target_value) as sum_dtp ,  
            sum(dtl.value) as sum_dtl from deliverable_category_org dco JOIN deliverable_category_unit dcu ON  dco.id = dcu.deliverable_category_org 
            JOIN deliverable_target_project dtp ON dtp.deliverable_category_unit = dcu.id JOIN projects ON dtp.project = projects.id
            JOIN deliverable_tracking_lineitem dtl ON dtp.id = dtl.deliverable_target_project  
            where dco.organization = ${ctx.query.organization} group by projects.id) select id, name , ROUND((sum_dtl * 100.0)/ sum_dtp) as avg_value from cte ORDER BY avg_value desc`)
            
            return data.rows && data.rows.length > 0 ? data.rows : [];
        } catch (error) {
            console.log(error)
            return ctx.badRequest(null, error.message);
        }
    },
    exportTable : async ctx => {
        try{            
            await exportTableAsCsv({ctx, tableName: 'deliverable_target_project', whereCondition: {project: ctx.query.project_in[0]}})
        } catch(error) {
            console.log(error)
            return ctx.badRequest(null, error.message);
        }
    }
};
