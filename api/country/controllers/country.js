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
        tableName: "countries",
        whereCondition: {},
        tableColumns: ["id", "name"],
      });
      return {
        message: `countries csv Downloaded Successfully`,
      };
    } catch (error) {
      console.log(error);
      return ctx.badRequest(error.message);
    }
  },
};
