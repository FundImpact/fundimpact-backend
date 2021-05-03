"use strict";

/**
 * Read the documentation (https://strapi.io/documentation/v3.x/concepts/controllers.html#core-controllers)
 * to customize this controller
 */

const { exportTableAsCsv } = require("../../../services/exportTable");
const { importTable } = require('../../../services/importTable')

module.exports = {
  exportTable: async (ctx) => {
    try {
      const { query } = ctx;
      const sendHeaderWhereValuesCanBeWritten = query.header;
      const tableColumns = sendHeaderWhereValuesCanBeWritten
        ? ["name *", "code", "description"]
        : ["id", "name", "code", "description"];
      await exportTableAsCsv({
        ctx,
        tableName: "impact_units_org",
        whereCondition: sendHeaderWhereValuesCanBeWritten
          ? false
          : { organization: ctx.query.organization_in[0], deleted: false },
        tableColumns: tableColumns.map((column) => column.replace("*", "")),
        tableColumnsToShwowInCsv: tableColumns,
      });
    } catch (error) {
      console.log(error);
      return ctx.badRequest(null, error.message);
    }
  },
  createImpactUnitOrgFromCsv: async (ctx) => {
    try {
      const columnsWhereValueCanBeInserted = ["name", "code", "description"];
      const { query } = ctx;
      const validateRowToBeInserted = (rowObj) => {
        if (!rowObj.name) {
          return { errorMessage: "name not present", valid: false };
        }
        return { valid: true };
      };
      await importTable({
        ctx,
        columnsWhereValueCanBeInserted,
        tableName: "impact_units_org",
        defaultFieldsToInsert: {
          organization: query.organization_in[0],
          deleted: false,
        },
        validateRowToBeInserted,
      });
      return { message: "Impact unit created", done: true };
    } catch (error) {
      console.log(error);
      return ctx.badRequest(error.message);
    }
  },
};

