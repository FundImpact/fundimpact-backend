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
    const rowObjsToBeInserted = [];

    lr.on("line", async (line) => {
      try {
        if (!tableColumns) {
          tableColumns = line.split(",").map((column) => column.trim());
        } else {
          lr.pause();
          const rowObj = await getRowObjToBeInserted(
            tableColumns,
            line,
            columnsWhereValueCanBeInserted,
            defaultFieldsToInsert,
            validateRowToBeInserted,
            updateRowToBeInserted
          );
          rowObjsToBeInserted.push(rowObj);
          lr.resume();
        }
      } catch (error) {
        lr.emit("error", error);
      }
    });

    await new Promise((resolve, reject) => {
      lr.on("end", async () => {
        await strapi.connections.default(tableName).insert(rowObjsToBeInserted);
        resolve();
      });
      lr.on("error", reject);
    });
  } catch (error) {
    return sendErrorMessage(error, ctx);
  }
};

const getRowObjToBeInserted = async (
  tableColumns,
  rowToInsert,
  columnsWhereValueCanBeInserted,
  defaultFieldsToInsert,
  validateRowToBeInserted,
  updateRowToBeInserted
) => {
  const insertObj = tableColumns.reduce(
    (insertObj, columnName, columnIndex) => {
      const columnValue = rowToInsert.split(",")[columnIndex];
      if (
        !checkIfValueCanBeInsertedInGivenColumn(
          columnsWhereValueCanBeInserted,
          columnName
        ) ||
        columnValue.trim() === ""
      ) {
        return insertObj;
      }
      insertObj[columnName] = columnValue;
      return insertObj;
    },
    { ...defaultFieldsToInsert }
  );
  const validateObj = await validateRowToBeInserted(insertObj);
  if (!validateObj.valid) {
    throw new Error(`${validateObj.errorMessage} for row ${rowToInsert}`);
  }
  const updatedInsertObj = await updateRowToBeInserted(insertObj);
  return updatedInsertObj;
};

const sendErrorMessage = (error, ctx) => {
  console.log(error);
  return ctx.badRequest(error.message);
};

const checkIfValueCanBeInsertedInGivenColumn = (
  columnsWhereValueCanBeInserted,
  columnName
) =>
  columnsWhereValueCanBeInserted.some(
    (restrictedColumn) => restrictedColumn == columnName
  );

module.exports = { importTable };
