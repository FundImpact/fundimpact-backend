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
        tableName: "impact_tracking_lineitem",
        whereCondition: (builder) =>
          builder.whereIn(
            "impact_target_project",
            ctx.query.impact_target_project_in
          ),
      });
    } catch (error) {
      console.log(error);
      return ctx.badRequest(null, error.message);
    }
  },
};
