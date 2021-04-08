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
        tableName: "impact_units_org",
        whereCondition: { organization: ctx.query.organization_in[0] },
      });
    } catch (error) {
      console.log(error);
      return ctx.badRequest(null, error.message);
    }
  },
};
