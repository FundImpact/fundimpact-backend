const JSONStream = require("JSONStream");
const { Transform } = require("json2csv");

const exportTableAsCsv = async ({
  ctx,
  tableName,
  whereCondition,
  tableColumns,
  tableColumnsToShwowInCsv = []
}) => {
  try {
    const { res } = ctx;
    if(!tableColumnsToShwowInCsv.length){
      tableColumnsToShwowInCsv = tableColumns;
    }
    const transformOpts = { highWaterMark: 16384, encoding: "utf-8" };
    const json2csv = new Transform(
      { fields: tableColumnsToShwowInCsv },
      transformOpts
    );
    const stream = strapi.connections
      .default(tableName)
      .column(tableColumns)
      .where(whereCondition)
      .stream();
    ctx.body = ctx.req.pipe;
    ctx.set("Content-Disposition", `attachment; filename="${tableName}.csv"`);
    ctx.set("Content-Type", "text/csv");
    stream.pipe(JSONStream.stringify()).pipe(json2csv).pipe(res);
    stream.on("error", (error) => {
      console.error(error);
    });
    return await new Promise((resolve) => stream.on("end", () => resolve));
  } catch (err) {
    console.error(err);
    return ctx.throw(500, err.message);
  }
};

module.exports = { exportTableAsCsv };
