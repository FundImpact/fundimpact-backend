'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/v3.x/concepts/controllers.html#core-controllers)
 * to customize this controller
 */

const JSONStream = require("JSONStream");
const { Transform } = require("json2csv");
const { importTable } = require('../../../services/importTable')
const { isRowIdPresentInTable } = require('../../../utils')
const {
  getQueryForImpactTargetProjectTargetValueSumForEachProject,
  getQueryForImpactTracklineValueSumForEachProject,
} = require("../../impact-category-org/services/impact-category-org");

module.exports = {
    impact_achieved : async ctx => {
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
              { "itl_sum_table.id": "itp_sum_table.id" }
            )
            .select(
              "itl_sum_table.id",
              "itl_sum_table.name",
              knex.raw(
                `ROUND((itl_sum_table.itl_sum/itp_sum_table.itp_sum)*100) as avg_value`
              )
            )
            .orderBy("avg_value", "desc");

          return data;
        } catch (error) {
          console.log(error);
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
                obj['itp.deleted'] = false; 
                for (let k in obj) {
                  if (
                    [
                      "ico.organization",
                      "organization",
                      "project",
                      "itp.project",
                      "itp.deleted",
                    ].includes(k)
                  ) {
                    conditions.push(k + "=" + obj[k]);
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
    },
    exportTable : async (ctx) => {
        try {
          const { res, params, query } = ctx;
          const sendHeaderWhereValuesCanBeWritten = query.header;
          const tableColumns = sendHeaderWhereValuesCanBeWritten
            ? [
                "name *",
                "description",
                "target_value *",
                "impact_category_unit *",
                "sustainable_development_goal *",
              ]
            : [
                "id",
                "name",
                "category",
                "target",
                "achieved",
                "progress",
                "sdg",
              ];
          if (
            !isProjectIdAvailableInUserProjects(
              query.project_in,
              params.projectId
            )
          ) {
            throw new Error("Project not assigned to user");
          }
          const transformOpts = { highWaterMark: 16384, encoding: "utf-8" };
          const json2csv = new Transform(
            {
              fields: tableColumns,
            },
            transformOpts
          );
          ctx.body = ctx.req.pipe;
          ctx.set("Content-Disposition", `attachment; filename="budget.csv"`);
          ctx.set("Content-Type", "text/csv");
          const impactTargetProjectStream = strapi.connections
            .default("impact_target_project")
            .join("impact_category_unit", {
              [`impact_target_project.impact_category_unit`]: "impact_category_unit.id",
            })
            .join("impact_category_org", {
              [`impact_category_unit.impact_category_org`]: "impact_category_org.id",
            })
            .join("impact_units_org", {
              [`impact_category_unit.impact_units_org`]: "impact_units_org.id",
            })
            .leftJoin("impact_tracking_lineitem", {
              ["impact_target_project.id"]:
                "impact_tracking_lineitem.impact_target_project",
            })
            .join("sustainable_development_goal", {
              ["sustainable_development_goal.id"]:
                "impact_target_project.sustainable_development_goal",
            })
            .groupBy("impact_target_project.id")
            .groupBy("impact_category_org.id")
            .groupBy("impact_units_org.id")
            .groupBy("sustainable_development_goal.id")
            .column([
              "impact_target_project.id",
              "impact_target_project.name as name",
              "impact_category_org.name as category",
              strapi.connections.default.raw(
                `concat(impact_target_project.target_value, ' ', impact_units_org.name) as target`
              ),
              strapi.connections.default.raw(
                `concat(sum(impact_tracking_lineitem.value), ' ', impact_units_org.name) as achieved`
              ),
              strapi.connections.default.raw(
                `sum(impact_tracking_lineitem.value) / impact_target_project.target_value * 100 as progress`
              ),
              "sustainable_development_goal.icon as sdg",
            ])
            .where(
              sendHeaderWhereValuesCanBeWritten
                ? false
                : {
                    project: params.projectId,
                    ["impact_target_project.deleted"]: false,
                    ["impact_tracking_lineitem.deleted"]: false,
                  }
            )
            .stream();
          impactTargetProjectStream
            .pipe(JSONStream.stringify())
            .pipe(json2csv)
            .pipe(res);
          return await new Promise((resolve) =>
            impactTargetProjectStream.on("end", resolve)
          );
        } catch (error) {
          console.log(error);
          return ctx.badRequest(null, error.message);
        }
    },
    createImpactTargetProjectFromCsv: async (ctx) => {
        try {
          const { query, params } = ctx;
          const projectBelongToUser = checkIfProjectBelongToUser(
            query.project_in,
            params.projectId
          );
          if (!projectBelongToUser) {
            throw new Error("Project is not assigned to user");
          }
          const columnsWhereValueCanBeInserted = [
            "name",
            "description",
            "target_value",
            "impact_category_unit",
            "sustainable_development_goal"
          ];
          const validateRowToBeInserted = async (rowObj) =>
            await validateRowToBeInsertedInImpactTargetProject(rowObj, ctx.locals.organizationId);
      
          await importTable({
            columnsWhereValueCanBeInserted,
            ctx,
            tableName: "impact_target_project",
            defaultFieldsToInsert: { project: params.projectId, deleted: false, },
            validateRowToBeInserted,
          });
          return { message: "Impact Target Created", done: true };
        } catch (error) {
          console.log(error);
          return ctx.badRequest(null, error.message);
        }
   }
 };

const isProjectIdAvailableInUserProjects = (userProjects, projectId) =>
  userProjects.some((userProject) => userProject == projectId);

const validateRowToBeInsertedInImpactTargetProject = async (rowObj, organizationId) => {
  const requiredColumns = [
    "name",
    "target_value",
    "impact_category_unit",
    "sustainable_development_goal",
  ];

  for (let column of requiredColumns) {
    if (!rowObj[column]) {
      return { valid: false, errorMessage: `${column} not present` };
    }
  }

  if (isNaN(rowObj.target_value)) {
    return {
      valid: false,
      errorMessage: "target_value not valid",
    };
  }

  const impactCategoryUnit = await strapi.connections
    .default("impact_category_org")
    .join("impact_category_unit", {
      "impact_category_org.id": "impact_category_unit.impact_category_org",
    })
    .where({
      "impact_category_org.organization": organizationId,
      "impact_category_unit.id": rowObj.impact_category_unit,
    });
  if (!impactCategoryUnit.length) {
    return {
      valid: false,
      errorMessage: "impact_category_unit not valid",
    };
  }

  // if (
  //   !(await isRowIdPresentInTable({
  //     rowId: rowObj.impact_category_unit,
  //     strapi,
  //     tableName: "impact_category_unit",
  //   }))
  // ) {
  //   return {
  //     valid: false,
  //     errorMessage: "impact_category_unit not valid",
  //   };
  // }
  if (
    !(await isRowIdPresentInTable({
      rowId: rowObj.sustainable_development_goal,
      strapi,
      tableName: "sustainable_development_goal",
    }))
  ) {
    return {
      valid: false,
      errorMessage: "sustainable_development_goal not valid",
    };
  }
  return { valid: true };
};
  
  const checkIfProjectBelongToUser = (userProjects, projectId) =>
    !!userProjects.find((userProject) => userProject == projectId);
  
