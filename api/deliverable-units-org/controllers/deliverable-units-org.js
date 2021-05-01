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
        tableName: "deliverable_unit_org",
        ctx,
        whereCondition: sendHeaderWhereValuesCanBeWritten
          ? false
          : { organization: ctx.query.organization_in[0], deleted: false },
        tableColumns: tableColumns.map((column) => column.replace("*", "")),
        tableColumnsToShwowInCsv: sendHeaderWhereValuesCanBeWritten
          ? ["name *", "code", "description", "deliverable_category_org *"]
          : ["id", "name", "code", "description"],
      });
    } catch (error) {
      console.error(error);
      return ctx.badRequest(null, error.message);
    }
  },
  createDeliverableUnitOrgFromCsv: async (ctx) => {
    try {
      const { request } = ctx;
      var destinationPath = request.files.importTable.path;
      var lr = new LineByLineReader(destinationPath);
      let csvHeader = null;
      const columnsWhereValueCanBeInserted = ["name", "code", "description"];
      const rowObjsToBeInserted = [];

      lr.on("line", async (line) => {
        try {
          if (!csvHeader) {
            csvHeader = line
              .split(",")
              .map((column) =>
                column.replace("*", "").replace("(YYYY-MM-DD)", "").trim()
              );
          } else {
            lr.pause();
            const rowObject = await getRowObjToBeInserted(
              csvHeader,
              line,
              columnsWhereValueCanBeInserted,
              ctx
            );
            rowObjsToBeInserted.push(rowObject);
            lr.resume();
          }
        } catch (err) {
          throw lr.emit("error", err);
        }
      });
      await new Promise((resolve, reject) => {
        lr.on("end", async () => {
          try {
            await insertRowsInDeliverableUnitOrgTable(rowObjsToBeInserted);
            resolve();
          } catch (err) {
            lr.emit("error", err);
          }
        });
        lr.on("error", (error) => reject(error));
      });
      return { message: "Deliverable Unit Created", done: true };
    } catch (error) {
      console.log(error);
      return ctx.badRequest(error.message);
    }
  },
};

const insertRowsInDeliverableUnitOrgTable = async (rowObjsToBeInserted) => {
  for (let rowObj of rowObjsToBeInserted) {
    const { deliverableCategoryOrgId } = rowObj;
    delete rowObj.deliverableCategoryOrgId;
    await strapi.connections
      .default("deliverable_unit_org")
      .insert(rowObj)
      .returning("id")
      .then(([deliverableUnitOrgId]) =>
        strapi.connections.default("deliverable_category_unit").insert({
          deliverable_category_org: deliverableCategoryOrgId,
          deliverable_units_org: deliverableUnitOrgId,
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
    (insertObj, columnName, columnIndex) => {
      if (
        !checkIfValueCanBeInsertedInGivenColumn(
          columnsWhereValueCanBeInserted,
          columnName
        )
      ) {
        return insertObj;
      }
      insertObj[columnName] = rowToInsert.split(",")[columnIndex];
      return insertObj;
    },
    { organization: query.organization_in[0], deleted: false }
  );
  const deliverableCategoryOrgId = getColumnValueFromRowToBeInserted(
    "deliverable_category_org",
    rowToInsert,
    tableColumns
  );
  const isRowValid = await validateRowToBeInserted(
    {
      ...insertObj,
      deliverable_category_org: deliverableCategoryOrgId,
    },
    query.organization_in[0]
  );
  if (!isRowValid.valid) {
    throw new Error(`${isRowValid.errorMessage} for row ${rowToInsert}`);
  }
  return { ...insertObj, deliverableCategoryOrgId };
};

const validateRowToBeInserted = async (rowObj, organizationId) => {
  if (!rowObj.name) {
    return { valid: false, errorMessage: "Name not provided" };
  }
  if (!rowObj.deliverable_category_org) {
    return {
      valid: false,
      errorMessage: "deliverable_category_org not provided",
    };
  }
  if (
    !(await canDeliverableCategoryOrgInsertedInDeliverableCategoryUnitTable(
      rowObj.deliverable_category_org,
      organizationId
    ))
  ) {
    return { valid: false, errorMessage: "deliverable_category_org not valid" };
  }
  return { valid: true };
};

const canDeliverableCategoryOrgInsertedInDeliverableCategoryUnitTable = async (
  deliverableCategoryOrgId,
  organizationId
) => {
  const deliverableCategoryOrgWithGivenId = await strapi.connections
    .default("deliverable_category_org")
    .where({ id: deliverableCategoryOrgId, organization: organizationId });

  if (
    !(
      deliverableCategoryOrgWithGivenId &&
      deliverableCategoryOrgWithGivenId.length
    )
  ) {
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
