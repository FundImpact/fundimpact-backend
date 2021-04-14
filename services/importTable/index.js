const LineByLineReader = require("line-by-line");

const importTable = async ({
  ctx,
  tableName,
  columnsWhereValueCanBeInserted,
  defaultFieldsToInsert = {},
  validateRowToBeInserted = () => true,
  updateRowToBeInserted = (rowObj) => rowObj,
}) => {
  try {
    const { request } = ctx;
    var destinationPath = request.files.importTable.path;
    var lr = new LineByLineReader(destinationPath);
    let tableColumns = null;

    lr.on("line", async (line) => {
      if (!tableColumns) {
        tableColumns = line.split(",").map((column) => column.trim());
      } else {
        await insertRowInTable(
          tableColumns,
          line,
          columnsWhereValueCanBeInserted,
          tableName,
          defaultFieldsToInsert,
          ctx,
          validateRowToBeInserted,
          updateRowToBeInserted
        );
      }
    });
    lr.on("error", (error) => sendErrorMessage(error, ctx));
    await new Promise((resolve) => lr.on("end", resolve));
  } catch (error) {
    return sendErrorMessage(error, ctx);
  }
};

const insertRowInTable = async (
  tableColumns,
  rowToInsert,
  columnsWhereValueCanBeInserted,
  tableName,
  defaultFieldsToInsert,
  ctx,
  validateRowToBeInserted,
  updateRowToBeInserted
) => {
  try {
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
      { ...defaultFieldsToInsert }
    );
    const isRowValid = await validateRowToBeInserted(insertObj);
    if (!isRowValid) {
      return;
    }
    const updatedInsertObj = await updateRowToBeInserted(insertObj);
    await strapi.connections.default(tableName).insert([updatedInsertObj]);
  } catch (error) {
    return sendErrorMessage(error, ctx);
  }
};

const sendErrorMessage = (error, ctx) => {
  console.error(error);
  return ctx.badRequest(null, error.message);
};

const checkIfValueCanBeInsertedInGivenColumn = (
  columnsWhereValueCanBeInserted,
  columnName
) =>
  columnsWhereValueCanBeInserted.some(
    (restrictedColumn) => restrictedColumn == columnName
  );

module.exports = { importTable };
