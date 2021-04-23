'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/v3.x/concepts/controllers.html#core-controllers)
 * to customize this controller
 */

 const JSONStream = require("JSONStream");
 const { Transform } = require("json2csv");
const { importTable } = require('../../../services/importTable')
const { isRowIdPresentInTable } = require('../../../utils')

module.exports = {
    impact_achieved : async ctx => {
        try {
            let data = await strapi.connections.default.raw(`WITH cte AS (select projects.id , projects.name ,sum(itp.target_value) as sum_itp ,  
            sum(itl.value) as sum_itl from impact_category_org ico JOIN impact_category_unit icu ON  ico.id = icu.impact_category_org 
            JOIN impact_target_project itp ON itp.impact_category_unit = icu.id JOIN projects ON itp.project = projects.id
            JOIN impact_tracking_lineitem itl ON itp.id = itl.impact_target_project
            LEFT JOIN financial_year fy ON itl.financial_year = fy.id
            LEFT JOIN annual_year ay ON itl.annual_year = ay.id    
            where ico.organization = ${ctx.query.organization}
            ${ctx.query.financial_year && ctx.query.financial_year.length ? `and fy.id in (` + ctx.query.financial_year.join() + `)` : ''}   
            ${ctx.query.annual_year && ctx.query.annual_year.length ? `and ay.id in (` + ctx.query.annual_year.join() + `)` : ''}
            group by projects.id) select id, name , ROUND((sum_itl * 100.0)/ sum_itp) as 
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
    },
    exportTable : async (ctx) => {
        try {
          const { res, params, query } = ctx;
          if (
            !isProjectIdAvailableInUserProjects(query.project_in, params.projectId)
          ) {
            throw new Error("Project not assigned to user");
          }
          const transformOpts = { highWaterMark: 16384, encoding: "utf-8" };
          const json2csv = new Transform(
            {
              fields: [
                "id",
                "name",
                "category",
                "target",
                "achieved",
                "progress",
                "sdg",
              ],
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
            .where({ project: params.projectId })
            .stream();
          impactTargetProjectStream.pipe(JSONStream.stringify()).pipe(json2csv).pipe(res);
          return await new Promise((resolve) => impactTargetProjectStream.on("end", resolve));
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
            await validateRowToBeInsertedInImpactTargetProject(rowObj);
      
          await importTable({
            columnsWhereValueCanBeInserted,
            ctx,
            tableName: "impact_target_project",
            defaultFieldsToInsert: { project: params.projectId },
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

const validateRowToBeInsertedInImpactTargetProject = async (rowObj) => {
    const areRequiredColumnsPresent = [
      "name",
      "target_value",
      "impact_category_unit",
      "sustainable_development_goal"
    ].every((column) => !!rowObj[column]);
    console.log(`areRequiredColumnsPresent`, areRequiredColumnsPresent)
    if (!areRequiredColumnsPresent) {
      return false;
    }
    if (
      !(await isRowIdPresentInTable({
        rowId: rowObj.impact_category_unit,
        strapi,
        tableName: "impact_category_unit",
      }))
    ) {
      return false;
    }
    if (
      !(await isRowIdPresentInTable({
        rowId: rowObj.sustainable_development_goal,
        strapi,
        tableName: "sustainable_development_goal",
      }))
    ) {
      return false;
    }
    return true;
  };
  
  const checkIfProjectBelongToUser = (userProjects, projectId) =>
    !!userProjects.find((userProject) => userProject == projectId);
  
