'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/v3.x/concepts/controllers.html#core-controllers)
 * to customize this controller
 */

const {exportTableAsCsv} = require('../../../services/exportTable')
const { importTable } = require("../../../services/importTable");
const {
  getQueryForDeliverableTargetProjectTargetValueSumForEachProject,
  getQueryForDeliverableTracklineValueSumForEachProject,
} = require("../services/deliverable-category-org");

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
          const knex = strapi.connections.default;
          let data = await knex({
            dtp_sum_table: getQueryForDeliverableTargetProjectTargetValueSumForEachProject(
              ctx.query
            ),
          })
            .join(
              {
                dtl_sum_table: getQueryForDeliverableTracklineValueSumForEachProject(
                  ctx.query
                ),
              },
              {
                "dtl_sum_table.id": "dtp_sum_table.id",
                "dtl_sum_table.dtl_sum": "dtp_sum_table.dtp_sum",
              }
            )
            .count("dtl_sum_table.id");

          return data && data.length > 0 && data[0].count ? data[0].count : 0;
        } catch (error) {
          console.log(error);
          return ctx.badRequest(null, error.message);
        }
    },
    avgAchivementDeliverableByOrg :  async ctx => {
        try {
          const knex = strapi.connections.default;
          let data = await knex({
            dtp_sum_table: knex
              .select(knex.raw("sum(dtp.target_value) as dtp_sum"))
              .from("workspaces")
              .join("projects", { "workspaces.id": "projects.workspace" })
              .join("deliverable_target_project as dtp", {
                "dtp.project": "projects.id",
              })
              .where({
                "workspaces.organization": ctx.query.organization,
                "dtp.deleted": false,
              }),
            dtl_sum_table: knex
              .select(knex.raw("sum(dtl.value) as dtl_sum"))
              .from("workspaces")
              .join("projects", { "workspaces.id": "projects.workspace" })
              .join("deliverable_target_project as dtp", {
                "dtp.project": "projects.id",
              })
              .join("deliverable_tracking_lineitem as dtl", {
                "dtl.deliverable_target_project": "dtp.id",
              })
              .leftJoin("financial_year", {
                "financial_year.id": "dtl.financial_year",
              })
              .leftJoin("annual_year", {
                "annual_year.id": "dtl.annual_year",
              })
              .where({
                "dtl.deleted": false,
                "dtp.deleted": false,
                "workspaces.organization": ctx.query.organization,
              })
              .modify(function (queryBuilder) {
                if (ctx.query.annual_year && ctx.query.annual_year.length) {
                  queryBuilder.whereIn("annual_year.id", ctx.query.annual_year);
                }
                if (
                  ctx.query.financial_year &&
                  ctx.query.financial_year.length
                ) {
                  queryBuilder.whereIn(
                    "financial_year.id",
                    ctx.query.financial_year
                  );
                }
              }),
          }).select(
            knex.raw(
              `ROUND((dtl_sum_table.dtl_sum/dtp_sum_table.dtp_sum)*100) as avg`
            )
          );

          return data.length && data[0].avg ? data[0].avg : 0;
        } catch (error) {
          console.log(error);
          return ctx.badRequest(null, error.message);
        }
    },
    achiveDeliverableVsTargetByOrg :  async ctx => {
        try {
            let data = await strapi.connections.default.raw(`WITH cte AS( select dtp.id , dtp.target_value as sum_dtp ,  
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
          const { query } = ctx;
          const sendHeaderWhereValuesCanBeWritten = query.header;
          const tableColumns = sendHeaderWhereValuesCanBeWritten
            ? ["name *", "code", "description"]
            : ["id", "name", "code", "description"]; 
          await exportTableAsCsv({
            ctx,
            tableName: "deliverable_category_org",
            tableColumns: tableColumns.map((column) => column.replace("*", "")),
            tableColumnsToShwowInCsv: tableColumns,
            whereCondition: sendHeaderWhereValuesCanBeWritten
              ? false
              : { organization: ctx.query.organization_in[0], deleted: false },
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
            if (!rowObj.name) {
              return { valid: false, errorMessage: "name not present" };
            }
            return { valid: true };
          }
          await importTable({
            columnsWhereValueCanBeInserted,
            ctx,
            tableName: "deliverable_category_org",
            defaultFieldsToInsert: { organization: query.organization_in[0], deleted: false },
            validateRowToBeInserted
          });
          return { message: "Deliverable Category Created", done: true };
        } catch (error) {
          console.log(error);
          return ctx.badRequest(null, error.message);
        }
    }
}
