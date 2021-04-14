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
      const { res, locals } = ctx;
      const transformOpts = { highWaterMark: 16384, encoding: "utf-8" };
      const json2csv = new Transform(
        {
          fields: ["id", "impact_category_org", "impact_unit_org"],
        },
        transformOpts
      );
      ctx.set("Content-Disposition", `attachment; filename="budget.csv"`);
      ctx.set("Content-Type", "text/csv");
      ctx.body = ctx.req.pipe;
      const stream = strapi.connections
        .default("impact_category_unit")
        .join("impact_category_org", {
          [`impact_category_unit.impact_category_org`]: "impact_category_org.id",
        })
        .join("impact_units_org", {
          [`impact_category_unit.impact_units_org`]: "impact_units_org.id",
        })
        .column([
          "impact_category_unit.id",
          strapi.connections.default.raw(
            `concat(impact_category_unit.impact_category_org, ' (', impact_category_org.name, ')') as impact_category_org`
          ),
          strapi.connections.default.raw(
            `concat(impact_category_unit.impact_units_org, ' (', impact_units_org.name, ')') as impact_unit_org`
          ),
        ])
        .where({
          "impact_category_org.organization": locals.organization_in[0],
          "impact_units_org.organization": locals.organization_in[0],
        })
        .stream();
      stream.pipe(JSONStream.stringify()).pipe(json2csv).pipe(res);
      stream.on("error", (error) => sendError(error, ctx));
      return await new Promise((resolve) => stream.on("end", resolve));
    } catch (error) {
      return sendError(error, ctx);
    }
  },
};

const sendError = (error, ctx) => {
  console.log(error);
  return ctx.badRequest(null, error.message);
};
