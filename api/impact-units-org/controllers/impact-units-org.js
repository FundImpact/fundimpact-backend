"use strict";

/**
 * Read the documentation (https://strapi.io/documentation/v3.x/concepts/controllers.html#core-controllers)
 * to customize this controller
 */

const { exportTableAsCsv } = require("../../../services/exportTable");
const LineByLineReader = require("line-by-line");

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
        tableColumnsToShwowInCsv: sendHeaderWhereValuesCanBeWritten
          ? ["name *", "code", "description", "impact_category_org *"]
          : ["id", "name", "code", "description"],
      });
    } catch (error) {
      console.log(error);
      return ctx.badRequest(null, error.message);
    }
  },
  createImpactUnitOrgFromCsv: async (ctx) => {
    try {
      const { request } = ctx;
      var destinationPath = request.files.importTable.path;
      var lr = new LineByLineReader(destinationPath);
      let csvHeader = null;
      const columnsWhereValueCanBeInserted = ["name", "code", "description"];
      lr.on("line", async (line) => {
        if (!csvHeader) {
          csvHeader = line.split(",");
        } else {
          await insertRowInImpactUnitOrganizationsTable(
            csvHeader,
            line,
            columnsWhereValueCanBeInserted,
            ctx
          );
        }
      });
      lr.on("error", (error) => {
        throw error;
      });
      await new Promise((resolve) => lr.on("end", resolve));
      return { message: "Impact Unit Created", done: true };
    } catch (error) {
      console.log(error);
      return ctx.badRequest(null, error.message);
    }
  },
};

const insertRowInImpactUnitOrganizationsTable = async (
  tableColumns,
  rowToInsert,
  columnsWhereValueCanBeInserted,
  ctx
) => {
  try {
    const { query } = ctx;
    const insertObj = tableColumns.reduce(
      (insertObj, colName, colIndex) => {
        if (
          !checkIfValueCanBeInsertedInGivenColumn(
            columnsWhereValueCanBeInserted,
            colName
          )
        ) {
          return insertObj;
        }
        insertObj[colName] = rowToInsert.split(",")[colIndex];
        return insertObj;
      },
      { organization: query.organization_in[0], deleted: false }
    );
    const impactCategoryOrgId = getColumnValueFromRowToBeInserted(
      "impact_category_org",
      rowToInsert,
      tableColumns
    );
    const isRowValid = await validateRowToBeInserted({
      ...insertObj,
      impact_category_org: impactCategoryOrgId,
    });
    if (!isRowValid) {
      return;
    }
    await strapi.connections
      .default("impact_units_org")
      .insert(insertObj)
      .returning("id")
      .then(([impactUnitOrgId]) =>
        strapi.connections.default("impact_category_unit").insert({
          impact_category_org: impactCategoryOrgId,
          impact_units_org: impactUnitOrgId,
          status: true,
        })
      );
  } catch (error) {
    console.log(error);
    return ctx.badRequest(null, error.message);
  }
};

const validateRowToBeInserted = async (rowObj) => {
  if (!rowObj.name) {
    return false;
  }
  if (!rowObj.impact_category_org) {
    return false;
  }
  if (
    !(await canImpactCategoryOrgInsertedInImpactCategoryUnitTable(
      rowObj.impact_category_org
    ))
  ) {
    return false;
  }
  return true;
};

const canImpactCategoryOrgInsertedInImpactCategoryUnitTable = async (
  impactCategoryOrgId
) => {
  const impactCategoryOrgWithGivenId = await strapi.connections
    .default("impact_category_org")
    .where({ id: impactCategoryOrgId });

  if (!(impactCategoryOrgWithGivenId && impactCategoryOrgWithGivenId.length)) {
    return false;
  }

  return true;
};

const getColumnValueFromRowToBeInserted = (
  columnName,
  rowToInsert,
  tableColumns
) => {
  const columnIndexInRowToBeInserted = tableColumns.findIndex(
    (tableColumn) => tableColumn == columnName
  );
  return rowToInsert.split(",")[columnIndexInRowToBeInserted];
};

const checkIfValueCanBeInsertedInGivenColumn = (
  columnsWhereValueCanBeInserted,
  columnName
) =>
  columnsWhereValueCanBeInserted.some(
    (restrictedColumn) => restrictedColumn == columnName
  );
