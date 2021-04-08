"use strict";

/**
 * Read the documentation (https://strapi.io/documentation/v3.x/concepts/controllers.html#core-controllers)
 * to customize this controller
 */

const { exportTableAsCsv } = require("../../../services/exportTable");

module.exports = {
  exportTable: async (ctx) => {
    try {
      await exportTableAsCsv({
        ctx,
        tableName: "grant_periods_project",
        whereCondition: (builder) =>
          builder
            .whereIn("project", ctx.query.project_in)
            .whereIn("donor", ctx.query.donor_in),
      });
    } catch (error) {
      console.log(error);
      return ctx.badRequest(null, error.message);
    }
  },
};
