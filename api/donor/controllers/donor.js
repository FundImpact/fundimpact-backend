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
      const { res, query } = ctx;
      const transformOpts = { highWaterMark: 16384, encoding: "utf-8" };
      const json2csv = new Transform(
        {
          fields: ["id", "name", "legal_name", "short_name", "country"],
        },
        transformOpts
      );
      ctx.body = ctx.req.pipe;
      ctx.set("Content-Disposition", `attachment; filename="budget.csv"`);
      ctx.set("Content-Type", "text/csv");
      const stream = strapi.connections
        .default("donors")
        .join("countries", {
          [`donors.country`]: "countries.id",
        })
        .column([
          "donors.id",
          "donors.name as name",
          "donors.legal_name",
          "donors.short_name",
          "countries.name as country",
        ])
        .where({ organization: query.organization_in[0] })
        .stream();
      stream.pipe(JSONStream.stringify()).pipe(json2csv).pipe(res);
      return await new Promise((resolve) => stream.on("end", resolve));
    } catch (error) {
      console.log(error);
      return ctx.badRequest(null, error.message);
    }
  },
};
