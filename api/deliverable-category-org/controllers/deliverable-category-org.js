'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/v3.x/concepts/controllers.html#core-controllers)
 * to customize this controller
 */

const {exportTableAsCsv} = require('../../../services/exportTable')
const { importTable } = require("../../../services/importTable");

module.exports = {
    projectCountDelCatByOrg :  async ctx => {
        try {
            let data = await strapi.connections.default.raw(`select dc.id, dc.name ,count(dtp.project) 
            from deliverable_category_org dc 
            INNER JOIN deliverable_category_unit dcu  ON dc.id = dcu.deliverable_category_org 
            INNER JOIN deliverable_target_project dtp ON dcu.id = dtp.deliverable_category_unit  
            where dc.id IN (${ctx.query.deliverable_category_org})
            and dc.deleted = false
            and dtp.deleted = false
            GROUP BY dc.id`)
            return data.rows && data.rows.length > 0 ? data.rows : [];
        } catch (error) {
            console.log(error)
            return ctx.badRequest(null, error.message);
        }
    },
    projectCountDelUnit :  async ctx => {
        try {
            let data = await strapi.connections.default.raw(`select du.id, du.name , count(dtp.project) 
            from deliverable_unit_org du 
            INNER JOIN deliverable_category_unit dcu ON du.id = dcu.deliverable_units_org 
            INNER JOIN deliverable_target_project dtp ON dcu.id = dtp.deliverable_category_unit 
            where du.id = ${ctx.query.deliverable_unit_org} 
            and du.deleted = false
            and dtp.deleted = false
            GROUP BY du.id`)
            return data.rows && data.rows.length > 0 ? data.rows : [];
        } catch (error) {
            console.log(error)
            return ctx.badRequest(null, error.message);
        }
    },
    totalDeliverableByOrg :  async ctx => {
        try {
            let data = await strapi.connections.default.raw(`select count(dtp.project) 
            from deliverable_category_org dco 
            JOIN deliverable_category_unit dcu ON  dco.id = dcu.deliverable_category_org 
            JOIN deliverable_target_project dtp ON dtp.deliverable_category_unit = dcu.id  
            where organization = ${ctx.query.organization}
            and dtp.deleted = false
            `)
            return data.rows && data.rows.length > 0 && data.rows[0].count  ? data.rows[0].count : 0;
        } catch (error) {
            console.log(error)
            return ctx.badRequest(null, error.message);
        }
    },
    totalAchivedProjectByOrg :  async ctx => {
        try {
            let data = await strapi.connections.default.raw(`WITH cte AS(select dtp.project ,sum(dtp.target_value) as sum_dtp ,  
            sum(dtl.value) as sum_dtl from deliverable_category_org dco 
            JOIN deliverable_category_unit dcu ON  dco.id = dcu.deliverable_category_org 
            JOIN deliverable_target_project dtp ON dtp.deliverable_category_unit = dcu.id 
            JOIN deliverable_tracking_lineitem dtl ON dtp.id = dtl.deliverable_target_project  
            LEFT JOIN financial_year fy ON dtl.financial_year = fy.id
            LEFT JOIN annual_year ay ON dtl.annual_year = ay.id
            where organization = ${ctx.query.organization} 
            and dtp.deleted = false
            and dtl.deleted = false
            ${ctx.query.financial_year && ctx.query.financial_year.length ? "and fy.id in (" + ctx.query.financial_year.join() + ")" : ''}   
            ${ctx.query.annual_year && ctx.query.annual_year.length ? "and ay.id in (" + ctx.query.annual_year.join() + ")" : ''}
            group by dtp.project) 
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
            sum(dtl.value) as sum_dtl 
            from deliverable_category_org dco JOIN deliverable_category_unit dcu ON  dco.id = dcu.deliverable_category_org 
            JOIN deliverable_target_project dtp ON dtp.deliverable_category_unit = dcu.id 
            JOIN deliverable_tracking_lineitem dtl ON dtp.id = dtl.deliverable_target_project  
            LEFT JOIN financial_year fy ON dtl.financial_year = fy.id
            LEFT JOIN annual_year ay ON dtl.annual_year = ay.id
            where organization = ${ctx.query.organization}
            and dtp.deleted = false
            and dtl.deleted = false
            ${ctx.query.financial_year && ctx.query.financial_year.length ? "and fy.id in (" + ctx.query.financial_year.join() + ")" : ''}   
            ${ctx.query.annual_year && ctx.query.annual_year.length ? "and ay.id in (" + ctx.query.annual_year.join() + ")" : ''}) 
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
            sum(dtl.value) as sum_dtl 
            from deliverable_category_org dco 
            JOIN deliverable_category_unit dcu ON  dco.id = dcu.deliverable_category_org 
            JOIN deliverable_target_project dtp ON dtp.deliverable_category_unit = dcu.id 
            JOIN deliverable_tracking_lineitem dtl ON dtp.id = dtl.deliverable_target_project  
            LEFT JOIN financial_year fy ON dtl.financial_year = fy.id
            LEFT JOIN annual_year ay ON dtl.annual_year = ay.id
            where organization = ${ctx.query.organization} 
            and dtp.deleted = false
            and dtl.deleted = false
            ${ctx.query.financial_year && ctx.query.financial_year.length ? "and fy.id in (" + ctx.query.financial_year.join() + ")" : ''}   
            ${ctx.query.annual_year && ctx.query.annual_year.length ? "and ay.id in (" + ctx.query.annual_year.join() + ")" : ''}
            group by dtp.id) 
            select count(id) from cte where sum_dtp = sum_dtl`)

            return data.rows && data.rows.length > 0 && data.rows[0].count  ? data.rows[0].count : 0;
        } catch (error) {
            console.log(error)
            return ctx.badRequest(null, error.message);
        }
    },
    deliverable_category_project_count :  async ctx => {
        try {
            let data = await strapi.connections.default.raw(`select dco.id , dco.name , count(dtp.project) from deliverable_category_org dco 
            JOIN deliverable_category_unit dcu ON dco.id = dcu.deliverable_category_org 
            JOIN deliverable_target_project dtp ON dcu.id = dtp.deliverable_category_unit 
            where organization = ${ctx.query.organization} 
            and dco.deleted = false
            and dtp.deleted = false
            group by dco.id order by count desc`)

            return data.rows && data.rows.length > 0  ? data.rows : 0;
        } catch (error) {
            console.log(error)
            return ctx.badRequest(null, error.message);
        }
    },
    deliverable_category_achieved_target :  async ctx => {
        try {
            let data = await strapi.connections.default.raw(`
            select dco.id , dco.name , sum(dtl.value) from deliverable_category_org dco 
            JOIN deliverable_category_unit dcu ON dco.id = dcu.deliverable_category_org 
            JOIN deliverable_target_project dtp ON dcu.id = dtp.deliverable_category_unit 
            JOIN deliverable_tracking_lineitem dtl ON dtp.id = dtl.deliverable_target_project
            LEFT JOIN financial_year fy ON dtl.financial_year = fy.id
            LEFT JOIN annual_year ay ON dtl.annual_year = ay.id
            where organization = ${ctx.query.organization}
            and dco.deleted = false
            and dtp.deleted = false
            and dtl.deleted = false
            ${ctx.query.financial_year && ctx.query.financial_year.length ? "and fy.id in (" + ctx.query.financial_year.join() + ")" : ''}   
            ${ctx.query.annual_year && ctx.query.annual_year.length ? "and ay.id in (" + ctx.query.annual_year.join() + ")" : ''}
            group by dco.id
             order by sum desc`)

            return data.rows && data.rows.length > 0  ? data.rows : 0;
        } catch (error) {
            console.log(error)
            return ctx.badRequest(null, error.message);
        }
    },
    exportTable: async (ctx) => {
        try {
          await exportTableAsCsv({
            ctx,
            tableName: "deliverable_category_org",
            tableColumnsToShow: ["id", "name", "code", "description"],
            whereCondition: {
              organization: ctx.query.organization_in[0],
              deleted: false,
            },
          });
        } catch (error) {
            console.log(error);
            return ctx.badRequest(null, error.message);
        }
    },
    createDeliverableCategoryOrgFromCsv: async (ctx) => {
        try {
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
            tableName: "deliverable_category_org",
            defaultFieldsToInsert: { organization: query.organization_in[0] },
            validateRowToBeInserted
          });
          return { message: "Deliverable Category Created", done: true };
        } catch (error) {
          console.log(error);
          return ctx.badRequest(null, error.message);
        }
    }
}
