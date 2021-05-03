"use strict";

/**
 * Read the documentation (https://strapi.io/documentation/v3.x/concepts/controllers.html#core-controllers)
 * to customize this controller
 */

const { exportTableAsCsv } = require("../../../services/exportTable");
const { importTable } = require("../../../services/importTable");

module.exports = {
  exportTable: async (ctx) => {
    try {
      const { query } = ctx;
      const sendHeaderWhereValuesCanBeWritten = query.header;
      const tableColumns = sendHeaderWhereValuesCanBeWritten
        ? ["name *", "code", "description"]
        : ["id", "name", "code", "description"];
      await exportTableAsCsv({
        tableName: "deliverable_unit_org",
        ctx,
        whereCondition: sendHeaderWhereValuesCanBeWritten
          ? false
          : { organization: ctx.query.organization_in[0], deleted: false },
        tableColumns: tableColumns.map((column) => column.replace("*", "")),
        tableColumnsToShwowInCsv: tableColumns,
      });
    } catch (error) {
      console.error(error);
      return ctx.badRequest(null, error.message);
    }
  },
  createDeliverableUnitOrgFromCsv: async (ctx) => {
    try {
      const { query } = ctx;
      const columnsWhereValueCanBeInserted = ["name", "code", "description"];
      const validateRowToBeInserted = (rowObj) => {
        if (!rowObj.name) {
          return { valid: false, errorMessage: "name not present" };
        }
        return { valid: true };
      };
      await importTable({
        columnsWhereValueCanBeInserted,
        ctx,
        tableName: "deliverable_unit_org",
        defaultFieldsToInsert: {
          organization: query.organization_in[0],
          deleted: false,
        },
        validateRowToBeInserted,
      });
      return { message: "Deliverable Unit Created", done: true };
    } catch (error) {
      console.log(error);
      return ctx.badRequest(error.message);
    }
  },
};
