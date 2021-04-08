const JSONStream = require("JSONStream");
const { Transform } = require("json2csv");

const getTableColumnNames = async (tableName) => {
  const emptyRow = await strapi.connections.default.raw(
    `select * from ${tableName} where false`
  );
  return emptyRow.fields.map(({ name }) => name);
};

const exportTableAsCsv = async ({ ctx, tableName, whereCondition }) => {
  const { res } = ctx;
  const tableColumns = await getTableColumnNames(tableName);
  const transformOpts = { highWaterMark: 16384, encoding: "utf-8" };
  const json2csv = new Transform({ fields: tableColumns }, transformOpts);
  const stream = strapi.connections
    .default(tableName)
    .where(whereCondition)
    .stream();
  stream.pipe(JSONStream.stringify()).pipe(json2csv).pipe(res);
  return await new Promise((resolve) => stream.on("end", resolve));
};

module.exports = { exportTableAsCsv };
