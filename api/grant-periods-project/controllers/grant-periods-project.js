"use strict";

/**
 * Read the documentation (https://strapi.io/documentation/v3.x/concepts/controllers.html#core-controllers)
 * to customize this controller
 */

const JSONStream = require("JSONStream");
const { Transform } = require("json2csv");

module.exports = {
  exportTable: async (ctx) => {
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
          fields: ["id", "donor", "start date", "end date"],
        },
        transformOpts
      );
      ctx.set("Content-Disposition", `attachment; filename="budget.csv"`);
      ctx.set("Content-Type", "text/csv");
      ctx.body = ctx.req.pipe;
      const grantPeriodProjectStream = strapi.connections
        .default("grant_periods_project")
        .join("donors", {
          [`donors.id`]: "grant_periods_project.donor",
        })
        .column([
          "grant_periods_project.id",
          "donors.name as donor",
          "grant_periods_project.start_date as start date",
          "grant_periods_project.end_date as end date",
        ])
        .where({ project: params.projectId })
        .stream();
      grantPeriodProjectStream.pipe(JSONStream.stringify()).pipe(json2csv).pipe(res);
      return await new Promise((resolve) => grantPeriodProjectStream.on("end", resolve));
    } catch (error) {
      console.log(error);
      return ctx.badRequest(null, error.message);
    }
  },
};

const isProjectIdAvailableInUserProjects = (userProjects, projectId) =>
  userProjects.some((userProject) => userProject == projectId);
