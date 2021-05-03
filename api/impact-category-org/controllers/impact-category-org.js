'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/v3.x/concepts/controllers.html#core-controllers)
 * to customize this controller
 */

const { exportTableAsCsv } = require("../../../services/exportTable");
const { importTable } = require('../../../services/importTable')
const {
  getQueryForImpactTargetProjectTargetValueSumForEachProject,
  getQueryForImpactTracklineValueSumForEachProject,
} = require("../services/impact-category-org");

module.exports = {
    projectCountImpCatByOrg :  async ctx => {
        try {
            let data = await strapi.connections.default.raw(`select ic.id, ic.name ,count(itp.project) 
            from impact_category_org ic 
            INNER JOIN impact_target_project itp ON ic.id = itp.impact_category_org  
            where ic.id = ${ctx.query.impact_category_org} 
            and ic.deleted = false
            and itp.deleted = false
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
            INNER JOIN  impact_target_project itp ON iu.id = itp.impact_units_org  
            where iu.id = ${ctx.query.impact_unit_org}
            and iu.deleted = false
            and itp.deleted = false
            GROUP BY iu.id;`)
            return data.rows && data.rows.length > 0 ? data.rows : [];
        } catch (error) {
            console.log(error)
            return ctx.badRequest(null, error.message);
        }
    },
    totalImpactProjectByOrg :  async ctx => {
        try {
            let data = await strapi.connections.default.raw(`select count(itp.project) 
            from impact_category_org ico 
            JOIN impact_target_project itp ON itp.impact_category_org = ico.id  
            where organization = ${ctx.query.organization}
            and itp.deleted = false
            `)
            return data.rows && data.rows.length > 0 && data.rows[0].count  ? data.rows[0].count : 0;
        } catch (error) {
            console.log(error)
            return ctx.badRequest(null, error.message);
        }
    },
    totalAchivedImpactProjectByOrg :  async ctx => {
        try {
          const knex = strapi.connections.default;
          let data = await knex({
            itp_sum_table: getQueryForImpactTargetProjectTargetValueSumForEachProject(
              ctx.query
            ),
          })
            .join(
              {
                itl_sum_table: getQueryForImpactTracklineValueSumForEachProject(
                  ctx.query
                ),
              },
              {
                "itl_sum_table.id": "itp_sum_table.id",
                "itl_sum_table.itl_sum": "itp_sum_table.itp_sum",
              }
            )
            .count("itl_sum_table.id");

          return data && data.length > 0 && data[0].count ? data[0].count : 0;
        } catch (error) {
          console.log(error);
          return ctx.badRequest(null, error.message);
        }
    },
    avgAchivementImpactByOrg :  async ctx => {
        try {
          const knex = strapi.connections.default;
          let data = await knex({
            itp_sum_table: knex
              .select(knex.raw("sum(itp.target_value) as itp_sum"))
              .from("workspaces")
              .join("projects", { "workspaces.id": "projects.workspace" })
              .join("impact_target_project as itp", {
                "itp.project": "projects.id",
              })
              .where({
                "workspaces.organization": ctx.query.organization,
                "itp.deleted": false,
              }),
            itl_sum_table: knex
              .select(knex.raw("sum(itl.value) as itl_sum"))
              .from("workspaces")
              .join("projects", { "workspaces.id": "projects.workspace" })
              .join("impact_target_project as itp", {
                "itp.project": "projects.id",
              })
              .join("impact_tracking_lineitem as itl", {
                "itl.impact_target_project": "itp.id",
              })
              .leftJoin("financial_year", {
                "financial_year.id": "itl.financial_year",
              })
              .leftJoin("annual_year", {
                "annual_year.id": "itl.annual_year",
              })
              .where({
                "workspaces.organization": ctx.query.organization,
                "itp.deleted": false,
                "itl.deleted": false,
              })
              .modify(function (queryBuilder) {
                if (
                  ctx.query.financial_year &&
                  ctx.query.financial_year.length
                ) {
                  queryBuilder.whereIn(
                    "financial_year.id",
                    ctx.query.financial_year
                  );
                }
                if (ctx.query.annual_year && ctx.query.annual_year.length) {
                  queryBuilder.whereIn("annual_year.id", ctx.query.annual_year);
                }
              }),
          }).select(
            knex.raw(
              `ROUND((itl_sum_table.itl_sum/itp_sum_table.itp_sum)*100) as avg`
            )
          );
          return data.length && data[0].avg ? data[0].avg : 0;
        } catch (error) {
          console.log(error);
          return ctx.badRequest(null, error.message);
        }
    },
    achiveImpactVsTargetByOrg :  async ctx => {
        try {
            let data = await strapi.connections.default.raw(`WITH cte AS( 
            select itp.id , itp.target_value as sum_itp , sum(itl.value) as sum_itl 
            from impact_category_org ico 
            JOIN impact_target_project itp ON itp.impact_category_org = ico.id 
            JOIN impact_tracking_lineitem itl ON itp.id = itl.impact_target_project  
            LEFT JOIN financial_year fy ON itl.financial_year = fy.id
            LEFT JOIN annual_year ay ON itl.annual_year = ay.id
            where organization = ${ctx.query.organization} 
            and itp.deleted = false
            and itl.deleted = false
            ${ctx.query.financial_year && ctx.query.financial_year.length ? "and fy.id in (" + ctx.query.financial_year.join() + ")" : ''}   
            ${ctx.query.annual_year && ctx.query.annual_year.length ? "and ay.id in (" + ctx.query.annual_year.join() + ")" : ''}
            group by itp.id) 
            select count(id) from cte where sum_itp = sum_itl`)

            return data.rows && data.rows.length > 0 && data.rows[0].count  ? data.rows[0].count : 0;
        } catch (error) {
            console.log(error)
            return ctx.badRequest(null, error.message);
        }
    },
    impact_category_project_count :  async ctx => {
        try {
            let data = await strapi.connections.default.raw(`select ico.id , ico.name , count(itp.project) 
            from impact_category_org ico 
            JOIN impact_target_project itp ON ico.id = itp.impact_category_org 
            where organization = ${ctx.query.organization} 
            and ico.deleted = false
            and itp.deleted = false
            group by ico.id order by count desc`)

            return data.rows && data.rows.length > 0 ? data.rows : [];
        } catch (error) {
            console.log(error)
            return ctx.badRequest(null, error.message);
        }
    },
    impact_category_achieved_value :  async ctx => {
        try {
            let data = await strapi.connections.default.raw(`select ico.id , ico.name , sum(itl.value) 
            from impact_category_org ico 
            JOIN impact_target_project itp ON ico.id = itp.impact_category_org 
            JOIN impact_tracking_lineitem itl ON itp.id = itl.impact_target_project
            LEFT JOIN financial_year fy ON itl.financial_year = fy.id
            LEFT JOIN annual_year ay ON itl.annual_year = ay.id
            where organization = ${ctx.query.organization} 
            and ico.deleted = false
            and itl.deleted = false
            and itp.deleted = false
            ${ctx.query.financial_year && ctx.query.financial_year.length ? "and fy.id in (" + ctx.query.financial_year.join() + ")" : ''}   
            ${ctx.query.annual_year && ctx.query.annual_year.length ? "and ay.id in (" + ctx.query.annual_year.join() + ")" : ''}   
            group by ico.id order by sum desc`)
            return data.rows && data.rows.length > 0 ? data.rows : [];
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
            tableColumns: tableColumns.map((column) => column.replace("*", "")),
            tableColumnsToShwowInCsv: tableColumns,
            ctx,
            tableName: "impact_category_org",
            whereCondition: sendHeaderWhereValuesCanBeWritten
              ? false
              : { organization: ctx.query.organization_in[0], deleted: false},
          });
        } catch (error) {
          console.log(error);
          return ctx.badRequest(null, error.message);
        }
    },
    createImpactCategoryOrgFromCsv: async (ctx) => {
        try {
          const { query } = ctx;
          const columnsWhereValueCanBeInserted = ["name", "code", "description", "shortname"];
          const validateRowToBeInserted = (rowObj) => {
            if (!rowObj.name) {
              return { valid: false, errorMessage: "name not present" };
            }
            return { valid: true };
          };
          await importTable({
            columnsWhereValueCanBeInserted,
            ctx,
            tableName: "impact_category_org",
            defaultFieldsToInsert: { organization: query.organization_in[0], deleted: false, },
            validateRowToBeInserted
          });
          return { message: "Impact category created", done: true };
        } catch (error) {
          console.log(error);
          return ctx.badRequest(null, error.message);
        }
    },
}
