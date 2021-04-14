'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/v3.x/concepts/controllers.html#core-controllers)
 * to customize this controller
 */

 const JSONStream = require("JSONStream");
 const { Transform } = require("json2csv");

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
    exportTable : async (ctx) => {
        try {
          const { res, params, query } = ctx;
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
              fields: [
                "id",
                "name",
                "description",
                "budget category",
                "total target amount",
                "spent",
                "progress"
              ],
            },
            transformOpts
          );
          ctx.body = ctx.req.pipe;
          ctx.set("Content-Disposition", `attachment; filename="budget.csv"`);
          ctx.set("Content-Type", "text/csv");
          const budgetTargetsProjectStream = strapi.connections
            .default("budget_targets_project")
            .join("budget_category_organizations", {
              [`budget_targets_project.budget_category_organization`]: "budget_category_organizations.id",
            })
            .leftJoin("budget_tracking_lineitem", {
              [`budget_tracking_lineitem.budget_targets_project`]: "budget_targets_project.id",
            })
            .groupBy("budget_targets_project.id")
            .groupBy("budget_category_organizations.id")
            .column([
              "budget_targets_project.id",
              "budget_targets_project.name as name",
              "budget_targets_project.description",
              "budget_category_organizations.name as budget category",
              "budget_targets_project.total_target_amount as total target amount",
              strapi.connections.default.raw(
                `sum(budget_tracking_lineitem.amount) as spent`
              ),
              strapi.connections.default.raw(
                `sum(budget_tracking_lineitem.amount) / budget_targets_project.total_target_amount * 100 as progress`
              ),
            ])
            .where({ project: params.projectId })
            .stream();
          budgetTargetsProjectStream.pipe(JSONStream.stringify()).pipe(json2csv).pipe(res);
          return await new Promise((resolve) => budgetTargetsProjectStream.on("end", resolve));
        } catch (error) {
          console.log(error);
          return ctx.badRequest(null, error.message);
        }
    }
};

const isProjectIdAvailableInUserProjects = (userProjects, projectId) =>
  userProjects.some((userProject) => userProject == projectId);