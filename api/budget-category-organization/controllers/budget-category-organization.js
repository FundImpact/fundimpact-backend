"use strict";

/**
 * Read the documentation (https://strapi.io/documentation/v3.x/concepts/controllers.html#core-controllers)
 * to customize this controller
 */

 const {exportTableAsCsv} = require('../../../services/exportTable')
const { importTable } = require("../../../services/importTable");

module.exports = {
    project_count_budget_cat: async ctx => {
        try {
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
            let data = await strapi.connections.default.raw(`select sum(btp.total_target_amount) 
            from budget_category_organizations bco 
            JOIN budget_targets_project btp ON bco.id = btp.budget_category_organization
            where bco.organization = ${ctx.query.organization}
            ${ctx.query.donor && ctx.query.donor.length  ? "and btp.donor in (" + ctx.query.donor.join() + ")" : ''}
            `)
            return data.rows && data.rows.length > 0 && data.rows[0].sum != null ? data.rows[0].sum : 0;
        } catch (error) {
            console.log(error)
            return ctx.badRequest(null, error.message);
        }
    },
    budget_spent_value : async ctx => {
        try {
            console.log(`ctx.query`, ctx.query)
            let data = await strapi.connections.default.raw(`select sum(btl.amount)  
            from budget_category_organizations bco 
            JOIN budget_targets_project btp ON bco.id = btp.budget_category_organization 
            JOIN budget_tracking_lineitem btl ON btp.id = btl.budget_targets_project  
            LEFT JOIN financial_year fy_org ON btl.fy_org = fy_org.id
            LEFT JOIN financial_year fy_donor ON btl.fy_donor = fy_donor.id
            LEFT JOIN annual_year ay ON btl.annual_year = ay.id
            where bco.organization = ${ctx.query.organization}
            ${ctx.query.financial_year && ctx.query.financial_year.length ? "and fy_org.id in ("+ ctx.query.financial_year.join() + ")" : ''}
            ${ctx.query.financial_year && ctx.query.financial_year.length ? "and fy_donor.id in (" + ctx.query.financial_year.join() + ")" : ''}
            ${ctx.query.annual_year && ctx.query.annual_year.length ? "and ay.id in (" + ctx.query.annual_year.join() + ")" : ''}
            ${ctx.query.donor && ctx.query.donor.length ? "and btp.donor in (" + ctx.query.donor.join() + ")" : ''}
            `)
            
            return data.rows && data.rows.length > 0 && data.rows[0].sum != null ? data.rows[0].sum : 0;
        } catch (error) {
            console.log(error)
            return ctx.badRequest(null, error.message);
        }
    },
    budget_category_target : async ctx => {
        try {
            let data = await strapi.connections.default.raw(`select bco.id , bco.name , sum(btp.total_target_amount) 
            from budget_category_organizations bco 
            JOIN budget_targets_project btp ON bco.id = btp.budget_category_organization
            where bco.organization = ${ctx.query.organization} 
            ${ctx.query.donor && ctx.query.donor.length ? "and btp.donor in (" + ctx.query.donor.join() + ")" : ''}
            group by bco.id order by sum desc`)
            
            return data.rows && data.rows.length > 0  ? data.rows : [];
        } catch (error) {
            console.log(error)
            return ctx.badRequest(null, error.message);
        }
    },
    budget_category_expenditure : async ctx => {
        try {
            let data = await strapi.connections.default.raw(`select bco.id , bco.name , sum(btl.amount) 
            from budget_category_organizations bco 
            JOIN budget_targets_project btp ON bco.id = btp.budget_category_organization 
            JOIN budget_tracking_lineitem btl ON btp.id = btl.budget_targets_project 
            LEFT JOIN annual_year ay on ay.id = btl.annual_year 
            LEFT JOIN financial_year fy_org on fy_org.id = btl.fy_org 
            LEFT JOIN financial_year fy_donor on fy_donor.id = btl.fy_donor
            LEFT  JOIN annual_year ay on ay.id = btl.annual_year
            where bco.organization = ${ctx.query.organization}
            ${ctx.query.donor && ctx.query.donor.length ? "and btp.donor in (" + ctx.query.donor.join() + ")" : ''}
            ${ctx.query.financial_year && ctx.query.financial_year.length ? "and fy_org.id in (" + ctx.query.financial_year.join() + ")" : ''}
            ${ctx.query.financial_year && ctx.query.financial_year.length ? "and fy_donor.id in (" + ctx.query.financial_year.join() + ")" : ''}
            ${ctx.query.annual_year && ctx.query.annual_year.length ? "and ay.id in (" + ctx.query.annual_year.join() + ")" : ''}
            group by bco.id
            order by sum desc`)
            return data.rows && data.rows.length > 0  ? data.rows : [];
        } catch (error) {
            console.log(error)
            return ctx.badRequest(null, error.message);
        }
    },
    exportTable : async (ctx) => {
        try {
          await exportTableAsCsv({
            ctx,
            tableName: "budget_category_organizations",
            whereCondition: { organization: ctx.query.organization_in[0] },
            tableColumnsToShow: ["id", "name", "code", "description"]
          });
          return {
            message: `budget_category_organizations.csv Downloaded Successfully`
          }
        } catch (error) {
          console.log(error);
          return ctx.badRequest(null, error.message);
        }
  },
  createBudgetCategoryOrgFromCsv: async (ctx) => {
    try{
      const { query } = ctx;
      const columnsWhereValueCanBeInserted = ["name", "code", "description"];
      const validateRowToBeInserted = (rowObj) => {
        if(!rowObj.name){
            return false;
        }
        return true;
      }
      await importTable({
        columnsWhereValueCanBeInserted,
        ctx,
        tableName: "budget_category_organizations",
        defaultFieldsToInsert: { organization: query.organization_in[0] },
        validateRowToBeInserted
      });
      return {message:"Budget category created", done: true}
    }catch(error){
      console.log(error);
      return ctx.badRequest(null, error.message);
    }
  },
};
