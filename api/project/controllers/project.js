"use strict";

/**
 * Read the documentation (https://strapi.io/documentation/v3.x/concepts/controllers.html#core-controllers)
 * to customize this controller
 */

const JSONStream = require("JSONStream");
const { Transform } = require("json2csv");
const { tables } = require("../../../utils/tables");
const { deleteAllTheTablesInAProject } = require("../services/project");
const deliverableType = ['deliverable','impact','outcome','activity','output']

module.exports = {
  exportTable: async (ctx) => {
    try {
      const { res } = ctx;
      const transformOpts = { highWaterMark: 16384, encoding: "utf-8" };
      const json2csv = new Transform(
        {
          fields: ["id", "name", "workspace"],
        },
        transformOpts
      );
      ctx.body = ctx.req.pipe;
      ctx.set("Content-Disposition", `attachment; filename="budget.csv"`);
      ctx.set("Content-Type", "text/csv");
      const stream = strapi.connections
        .default("projects")
        .join("workspaces", {
          [`projects.workspace`]: "workspaces.id",
        })
        .column([
          "projects.id as id",
          "projects.name as name",
          "workspaces.name as workspace",
        ])
        .where({ "workspaces.organization": ctx.locals.organizationId })
        .modify(function (queryBuilder) {
          if (ctx.locals.restrictedProjects) {
            queryBuilder.whereIn("projects.id", ctx.locals.restrictedProjects);
          }
        })
        .stream();
      stream.pipe(JSONStream.stringify()).pipe(json2csv).pipe(res);
      return await new Promise((resolve) => stream.on("end", resolve));
    } catch (error) {
      console.log(error);
      return ctx.badRequest(null, error.message);
    }
  },
  update: async (ctx) => {
    try {
      const {
        request: { body },
        params,
      } = ctx;
      //TODO write rollbacks
      if (checkIfUserWantToDeleteProject(body)) {
        await deleteAllTheTablesInAProject(params.id);
      }
      const knex = strapi.connections.default;
      const updatedProject = await knex(tables.projects)
        .where({ id: params.id })
        .modify(function (queryBuilder) {
          const updateObj = {};
          if (body.name) {
            updateObj.name = body.name;
          }
          if ("short_name" in body) {
            updateObj.short_name = body.short_name;
          }
          if ("description" in body) {
            updateObj.description = body.description;
          }
          if ("deleted" in body) {
            updateObj.deleted = body.deleted;
          }
          if("logframe_tracker" in body){
            updateObj.logframe_tracker = body.logframe_tracker;
          }
          queryBuilder.update(updateObj, [
            "id",
            "name",
            "short_name",
            "description",
            "workspace",
            "organization",
            "created_at",
            "updated_at",
            "deleted",
            "logframe_tracker"
          ]);
        });
      return updatedProject && updatedProject[0];
    } catch (err) {
      strapi.log.error(err);
      return ctx.throw(400, err);
    }
  },
  manageProjectTarget: async (ctx) => {
    try {
      let { formType, target, projects } = ctx.request.body;
  
      if (formType == "budget") {
        await strapi
          .query("project-with-budget-target")
          .delete({ budget_targets_project: target });
        if (projects.length > 0) {
          for (let e of projects) {
            await strapi
              .query("project-with-budget-target")
              .create({ budget_targets_project: target, project: e });
          }
        }
      } 
      else if (deliverableType.indexOf(formType) > -1 ) {
        await strapi
          .query("project-with-deliverable-target")
          .delete({ deliverable_target_project: target });
        if (projects.length > 0) {
          for (let e of projects) {
            await strapi
              .query("project-with-deliverable-target")
              .create({ deliverable_target_project: target, project: e });
          }
        }
      }
      return ctx.send({success:true,message:'Updated Successfully'})

    } catch (error) {
      console.log(error);
      return ctx.badRequest(null, error.message);
    }
  }

};

const checkIfUserWantToDeleteProject = (requestBody) => !!requestBody.deleted;
