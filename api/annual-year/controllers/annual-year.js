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
        tableName: "annual_year",
        whereCondition: {},
        tableColumns: ["id", "name"],
      });
      return {
        message: `annual_year Csv Downloaded Successfully`,
      };
    } catch (error) {
      console.log(error);
      return ctx.badRequest(null, error.message);
    }
  },
};
