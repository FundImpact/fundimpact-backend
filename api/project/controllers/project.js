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
};
