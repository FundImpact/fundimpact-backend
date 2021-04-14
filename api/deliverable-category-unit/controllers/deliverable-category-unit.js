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
          fields: ["id", "deliverable_category_org", "deliverable_unit_org"],
        },
        transformOpts
      );
      ctx.body = ctx.req.pipe;
      ctx.set("Content-Type", "text/csv");
      ctx.set("Content-Disposition", `attachment; filename="budget.csv"`);
      const stream = strapi.connections
        .default("deliverable_category_unit")
        .join("deliverable_category_org", {
          [`deliverable_category_unit.deliverable_category_org`]: "deliverable_category_org.id",
        })
        .join("deliverable_unit_org", {
          [`deliverable_category_unit.deliverable_units_org`]: "deliverable_unit_org.id",
        })
        .column([
          "deliverable_category_unit.id",
          strapi.connections.default.raw(
            `concat(deliverable_category_unit.deliverable_category_org, ' (', deliverable_category_org.name, ')') as deliverable_category_org`
          ),
          strapi.connections.default.raw(
            `concat(deliverable_category_unit.deliverable_units_org, ' (', deliverable_unit_org.name, ')') as deliverable_unit_org`
          ),
        ])
        .where({
          "deliverable_unit_org.organization": locals.organization_in[0],
          "deliverable_category_org.organization": locals.organization_in[0],
        })
        .stream();
        stream.on("error", (error) => sendError(error, ctx));
        stream.pipe(JSONStream.stringify()).pipe(json2csv).pipe(res);
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
