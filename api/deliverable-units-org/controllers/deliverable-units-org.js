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
      const tableColumnsToShow = sendHeaderWhereValuesCanBeWritten
        ? ["name", "code", "description"]
        : ["id", "name", "code", "description"]; 
      await exportTableAsCsv({
        tableName: "deliverable_unit_org",
        ctx,
        whereCondition: sendHeaderWhereValuesCanBeWritten
          ? false
          : { organization: ctx.query.organization_in[0], deleted: false },
        tableColumnsToShow,
      });
    }catch (error) {
        console.log(error);
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
      lr.on("line", async (line) => {
        if (!csvHeader) {
          csvHeader = line.split(",");
        } else {
          await insertRowInDeliverableUnitOrganizationsTable(
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
      return { message: "Deliverable Unit Created", done: true };
    } catch (error) {
      console.log(error);
      return ctx.badRequest(null, error.message);
    }
  },
}

const insertRowInDeliverableUnitOrganizationsTable = async (
  tableColumns,
  rowToInsert,
  columnsWhereValueCanBeInserted,
  ctx
) => {
  try {
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
      { organization: query.organization_in[0] }
    );
    const deliverableCategoryOrgId = getColumnValueFromRowToBeInserted(
      "deliverable_category_org",
      rowToInsert,
      tableColumns
    );
    const isRowValid = await validateRowToBeInserted({
      ...insertObj,
      deliverable_category_org: deliverableCategoryOrgId,
    });
    if (!isRowValid) {
      return;
    }
    await strapi.connections
      .default("deliverable_unit_org")
      .insert(insertObj)
      .returning("id")
      .then(([deliverableUnitOrgId]) =>
        strapi.connections.default("deliverable_category_unit").insert({
          deliverable_category_org: deliverableCategoryOrgId,
          deliverable_units_org: deliverableUnitOrgId,
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
  if (!rowObj.deliverable_category_org) {
    return false;
  }
  if (
    !(await canDeliverableCategoryOrgInsertedInDeliverableCategoryUnitTable(
      rowObj.deliverable_category_org
    ))
  ) {
    return false;
  }
  return true;
};

const canDeliverableCategoryOrgInsertedInDeliverableCategoryUnitTable = async (
  deliverableCategoryOrgId
) => {
  const deliverableCategoryOrgWithGivenId = await strapi.connections
    .default("deliverable_category_org")
    .where({ id: deliverableCategoryOrgId });

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
