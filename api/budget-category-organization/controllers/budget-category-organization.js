'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/v3.x/concepts/controllers.html#core-controllers)
 * to customize this controller
 */

module.exports = {
    project_count_budget_cat: async ctx => {
        try {
            console.log(ctx.query);
            let data = await strapi.connections.default.raw(`select budget_category_organizations.id, budget_category_organizations.name ,
            count(budget_targets_project.project) as project_count from budget_category_organizations INNER JOIN budget_targets_project
            ON budget_category_organizations.id = budget_targets_project.budget_category_organization 
            where budget_category_organizations.id = ${ctx.query.budget_category_organization} GROUP BY  budget_category_organizations.id`)
            return data.rows && data.rows.length > 0 ? data.rows : [];
        } catch (error) {
            console.log(error)
            return ctx.badRequest(null, error.message);
        }
    },
    budget_target_sum :  async ctx => {
        try {
            let data = await strapi.connections.default.raw(`select sum(btp.total_target_amount) from budget_category_organizations bco JOIN budget_targets_project btp 
            ON bco.id = btp.budget_category_organization  where organization = ${ctx.query.organization}`)
            return data.rows && data.rows.length > 0 && data.rows[0].sum != null ? data.rows[0].sum : 0;
        } catch (error) {
            console.log(error)
            return ctx.badRequest(null, error.message);
        }
    },
    budget_spent_value : async ctx => {
        try {
            let data = await strapi.connections.default.raw(`select sum(btl.amount)  from budget_category_organizations bco JOIN budget_targets_project btp ON bco.id = btp.budget_category_organization 
            JOIN budget_tracking_lineitem btl ON btp.id = btl.budget_targets_project  where organization = ${ctx.query.organization}`)
            
            return data.rows && data.rows.length > 0 && data.rows[0].sum != null ? data.rows[0].sum : 0;
        } catch (error) {
            console.log(error)
            return ctx.badRequest(null, error.message);
        }
    },
    budget_category_target : async ctx => {
        try {
            let data = await strapi.connections.default.raw(`select bco.id , bco.name , sum(btp.total_target_amount) from budget_category_organizations bco 
            JOIN budget_targets_project btp ON bco.id = btp.budget_category_organization where organization = ${ctx.query.organization} group by bco.id order by sum`)
            
            return data.rows && data.rows.length > 0  ? data.rows : [];
        } catch (error) {
            console.log(error)
            return ctx.badRequest(null, error.message);
        }
    },
    budget_category_expenditure : async ctx => {
        try {
            let data = await strapi.connections.default.raw(`select bco.id , bco.name , sum(btl.amount) from budget_category_organizations bco 
            JOIN budget_targets_project btp ON bco.id = btp.budget_category_organization 
            JOIN budget_tracking_lineitem btl ON btp.id = btl.budget_targets_project  where organization = ${ctx.query.organization} group by bco.id
             order by sum`)
            
            return data.rows && data.rows.length > 0  ? data.rows : [];
        } catch (error) {
            console.log(error)
            return ctx.badRequest(null, error.message);
        }
    }
};
