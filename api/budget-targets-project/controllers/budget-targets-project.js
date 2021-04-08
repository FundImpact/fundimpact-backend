'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/v3.x/concepts/controllers.html#core-controllers)
 * to customize this controller
 */

const {exportTableAsCsv} = require('../../../services/exportTable')

module.exports = {
    project_expenditure_value : async ctx => {
        try {
            let data = await strapi.connections.default.raw(` WITH btp AS ( select projects.id , projects.name,  sum(btp.total_target_amount) from budget_category_organizations bco 
            JOIN budget_targets_project btp ON btp.budget_category_organization = bco.id 
            JOIN projects ON projects.id = btp.project  where bco.organization = ${ctx.query.organization} group by projects.id) , 
            btl AS (select btp.project ,  sum(btl.amount)  from budget_category_organizations bco 
            JOIN budget_targets_project btp ON bco.id = btp.budget_category_organization 
            JOIN budget_tracking_lineitem btl ON btp.id = btl.budget_targets_project  where bco.organization = ${ctx.query.organization} group by btp.project) 
            select btl.project as project_id, btp.name,   ROUND((btl.sum * 100.0)/ btp.sum) as avg_value from btp JOIN btl ON btp.id = btl.project ORDER BY avg_value desc`)
            
            return data.rows && data.rows.length > 0 ? data.rows : [];
        } catch (error) {
            console.log(error)
            return ctx.badRequest(null, error.message);
        }
    },
    project_allocation_value : async ctx => {
        try {
            let data = await strapi.connections.default.raw(`WITH btp AS ( select btp.project,  sum(btp.total_target_amount) from budget_category_organizations bco 
            JOIN budget_targets_project btp ON btp.budget_category_organization = bco.id where bco.organization = ${ctx.query.organization} group by btp.project) , 
            frp AS (select projects.id , projects.name ,sum(frp.amount) from workspaces JOIN projects ON projects.workspace = workspaces.id 
            JOIN project_donor pd ON pd.project = projects.id JOIN fund_receipt_project frp ON frp.project_donor = pd.id where workspaces.organization = ${ctx.query.organization} group by projects.id)
            select frp.id as project_id , frp.name as name,  ROUND((frp.sum * 100.0)/ btp.sum) as avg_value  from btp JOIN frp ON btp.project = frp.id ORDER BY avg_value desc`)
            
            return data.rows && data.rows.length > 0 ? data.rows : [];
        } catch (error) {
            console.log(error)
            return ctx.badRequest(null, error.message);
        }
    },
    completed_project_count : async ctx => {
        try {
            let data = await strapi.connections.default.raw(`
            WITH btp AS ( select btp.project,  sum(btp.total_target_amount) from budget_category_organizations bco 
                        JOIN budget_targets_project btp ON btp.budget_category_organization = bco.id where bco.organization = ${ctx.query.organization} group by btp.project) , 
                        frp AS (select projects.id ,sum(frp.amount) from workspaces JOIN projects ON projects.workspace = workspaces.id 
                        JOIN project_donor pd ON pd.project = projects.id JOIN fund_receipt_project frp ON frp.project_donor = pd.id where workspaces.organization = ${ctx.query.organization} group by projects.id)
                        select count(btp.project) from btp JOIN frp ON btp.sum = frp.sum;`)
            return data.rows && data.rows.length > 0 && data.rows[0].count ? data.rows[0].count : 0;
        } catch (error) {
            console.log(error)
            return ctx.badRequest(null, error.message);
        }
    },
    donors_allocation_value : async ctx => {
        try {
            let data = await strapi.connections.default.raw(`select donors.id , donors.name , sum(btp.total_target_amount) from workspaces 
            JOIN projects ON projects.workspace = workspaces.id JOIN project_donor pd ON projects.id = pd.project 
            JOIN donors ON donors.id = pd.donor 
            JOIN budget_targets_project btp ON btp.project = projects.id where workspaces.organization = ${ctx.query.organization} group by donors.id ORDER BY sum desc`)
            
            return data.rows && data.rows.length > 0 ? data.rows : [];
        } catch (error) {
            console.log(error)
            return ctx.badRequest(null, error.message);
        }
    },
    donors_recieved_value : async ctx => {
        try {
            let data = await strapi.connections.default.raw(`select donors.id , donors.name , sum(frp.amount) from workspaces JOIN projects ON projects.workspace = workspaces.id 
            JOIN project_donor pd ON projects.id = pd.project 
            JOIN donors ON donors.id = pd.donor 
            JOIN fund_receipt_project frp ON frp.project_donor = pd.id where workspaces.organization = ${ctx.query.organization} group by donors.id ORDER BY sum desc`)
            
            return data.rows && data.rows.length > 0 ? data.rows : [];
        } catch (error) {
            console.log(error)
            return ctx.badRequest(null, error.message);
        }
    },
    exportTable : async ctx => {
        try{            
            await exportTableAsCsv({ctx, tableName: 'budget_targets_project', whereCondition: {project: ctx.query.project_in[0]}})
        } catch(error) {
            console.log(error)
            return ctx.badRequest(null, error.message);
        }
    }
};
