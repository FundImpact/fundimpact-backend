"use strict";

/**
 * Read the documentation (https://strapi.io/documentation/v3.x/concepts/controllers.html#core-controllers)
 * to customize this controller
 */

const { exportTableAsCsv } = require("../../../services/exportTable");

module.exports = {
  exportTable: async (ctx) => {
    try {
      const { params } = ctx;
      if (!params.countryId) {
        throw new Error("Country Not Provided");
      }
      await exportTableAsCsv({
        ctx,
        tableName: "financial_year",
        whereCondition: { country: params.countryId },
        tableColumnsToShow: ["id", "name"],
      });
      return {
        message: `financial_year Csv Downloaded Successfully`,
      };
    } catch (error) {
      console.log(error);
      return ctx.badRequest(null, error.message);
    }
  },
};
