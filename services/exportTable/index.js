const JSONStream = require("JSONStream");
const { Transform } = require("json2csv");

const exportTableAsCsv = async ({
  ctx,
  tableName,
  whereCondition,
  tableColumnsToShow,
}) => {
  const { res } = ctx;
  const transformOpts = { highWaterMark: 16384, encoding: "utf-8" };
  const json2csv = new Transform({ fields: tableColumnsToShow }, transformOpts);
  const stream = strapi.connections
  .default(tableName)
  .column(tableColumnsToShow)
  .where(whereCondition)
  .stream();
  ctx.body = ctx.req.pipe;
  ctx.set("Content-Disposition", `attachment; filename="${tableName}.csv"`);
  ctx.set("Content-Type", "text/csv");
  stream.pipe(JSONStream.stringify()).pipe(json2csv).pipe(res);
  await new Promise((resolve) => stream.on("end", () => resolve));
};

module.exports = { exportTableAsCsv };
