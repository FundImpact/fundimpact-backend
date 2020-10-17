'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/v3.x/concepts/controllers.html#core-controllers)
 * to customize this controller
 */

module.exports = {
    impact_achieved : async ctx => {
        try {
            let data = await strapi.connections.default.raw(`WITH cte AS (select projects.id , projects.name ,sum(itp.target_value) as sum_itp ,  
            sum(itl.value) as sum_itl from impact_category_org ico JOIN impact_category_unit icu ON  ico.id = icu.impact_category_org 
            JOIN impact_target_project itp ON itp.impact_category_unit = icu.id JOIN projects ON itp.project = projects.id
            JOIN impact_tracking_lineitem itl ON itp.id = itl.impact_target_project  
            where organization = ${ctx.query.organization} group by projects.id) select id, name , ROUND((sum_itl * 100.0)/ sum_itp) as 
            avg_value from cte ORDER BY avg_value desc`)
            
            return data.rows && data.rows.length > 0 ? data.rows : [];
        } catch (error) {
            console.log(error)
            return ctx.badRequest(null, error.message);
        }
    },
    sdg_target_count : async ctx =>{
        let condition;
        try {
            if(ctx.query && typeof ctx.query == 'object'){
                let obj = ctx.query;
                let conditions = [];
                obj['ico.organization'] = ctx.state.user.organization; 
                for(let k in obj){
                    if(['ico.organization',"organization","project","itp.project"].includes(k)){
                        conditions.push(k+"="+obj[k])    
                    }
                }
                condition = conditions.join(" AND ");
            }
            let queryString = `select sdg.id, sdg.name, sdg.icon , count(itp.id) from impact_category_org ico 
            JOIN impact_category_unit icu ON icu.impact_category_org = ico.id 
            JOIN impact_target_project itp ON itp.impact_category_unit = icu.id 
            JOIN sustainable_development_goal sdg ON sdg.id = itp.sustainable_development_goal  
            ${condition ? " where "+condition: ''} group by sdg.id ORDER BY count desc`;
            
            console.log("queryString",queryString)
            let data = await strapi.connections.default.raw(queryString)
            
            return data.rows && data.rows.length > 0 ? data.rows : [];
        } catch (error) {
            console.log(error)
            return ctx.badRequest(null, error.message);
        }
    }
};
