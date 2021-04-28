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
      let csvHeader = null;
      const columnsWhereValueCanBeInserted = ["name", "code", "description"];
      const rowObjsToBeInserted = [];
      var destinationPath = request.files.importTable.path;
      var lr = new LineByLineReader(destinationPath);

      lr.on("line", async (line) => {
        try {
          if (!csvHeader) {
            csvHeader = line.split(",");
          } else {
            lr.pause();
            const rowObj = await getRowObjToBeInserted(
              csvHeader,
              line,
              columnsWhereValueCanBeInserted,
              ctx
            );
            rowObjsToBeInserted.push(rowObj);
            lr.resume();
          }
        } catch (err) {
          throw lr.emit("error", err);
        }
      });
      await new Promise((resolve, reject) => {
        lr.on("end", async () => {
          try {
            await insertRowsInImpactUnitOrgTable(rowObjsToBeInserted);
            resolve();
          } catch (err) {
            lr.emit("error", err);
          }
        });
        lr.on("error", (error) => reject(error));
      });
      return { message: "Impact Unit Created", done: true };
    } catch (error) {
      console.log(error);
      return ctx.badRequest(error.message);
    }
  },
};

const insertRowsInImpactUnitOrgTable = async (rowObjsToBeInserted) => {
  for (let rowObj of rowObjsToBeInserted) {
    const { impactCategoryOrgId } = rowObj;
    delete rowObj.impactCategoryOrgId;
    await strapi.connections
      .default("impact_units_org")
      .insert(rowObj)
      .returning("id")
      .then(([impactUnitOrgId]) =>
        strapi.connections.default("impact_category_unit").insert({
          impact_category_org: impactCategoryOrgId,
          impact_units_org: impactUnitOrgId,
          status: true,
        })
      );
  }
};

const getRowObjToBeInserted = async (
  tableColumns,
  rowToInsert,
  columnsWhereValueCanBeInserted,
  ctx
) => {
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
  const isRowValid = await validateRowToBeInserted(
    {
      ...insertObj,
      impact_category_org: impactCategoryOrgId,
    },
    query.organization_in[0]
  );
  if (!isRowValid.valid) {
    throw new Error(`${isRowValid.errorMessage} for row ${rowToInsert}`);
  }
  return { ...insertObj, impactCategoryOrgId };
};

const validateRowToBeInserted = async (rowObj, organizationId) => {
  if (!rowObj.name) {
    return { valid: false, errorMessage: "Name not provided" };
  }
  if (!rowObj.impact_category_org) {
    return { valid: false, errorMessage: "impact_category_org not provided" };
  }
  if (
    !(await canImpactCategoryOrgInsertedInImpactCategoryUnitTable(
      rowObj.impact_category_org,
      organizationId
    ))
  ) {
    return { valid: false, errorMessage: "impact_category_org not valid" };
  }
  return { valid: true };
};

const canImpactCategoryOrgInsertedInImpactCategoryUnitTable = async (
  impactCategoryOrgId,
  organizationId
) => {
  const impactCategoryOrgWithGivenId = await strapi.connections
    .default("impact_category_org")
    .where({ id: impactCategoryOrgId, organization: organizationId });

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
