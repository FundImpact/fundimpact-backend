"use strict";

/**
 * Read the documentation (https://strapi.io/documentation/v3.x/concepts/controllers.html#core-controllers)
 * to customize this controller
 */
const JSONStream = require("JSONStream");
const { Transform } = require("json2csv");
const { importTable } = require("../../../services/importTable");
const { isRowIdPresentInTable } = require("../../../utils");

module.exports = {
  exportTable: async (ctx) => {
    try {
      const { res, query } = ctx;
      const transformOpts = { highWaterMark: 16384, encoding: "utf-8" };
      const sendHeaderWhereValuesCanBeWritten = query.header;
      const tableColumns = !sendHeaderWhereValuesCanBeWritten
        ? ["id", "name", "legal_name", "short_name", "country"]
        : ["name *", "legal_name", "short_name", "country *"];
      const json2csv = new Transform(
        {
          fields: tableColumns,
        },
        transformOpts
      );
      ctx.body = ctx.req.pipe;
      ctx.set("Content-Disposition", `attachment; filename="budget.csv"`);
      ctx.set("Content-Type", "text/csv");
      const stream = strapi.connections
        .default("donors")
        .join("countries", {
          [`donors.country`]: "countries.id",
        })
        .where(
          sendHeaderWhereValuesCanBeWritten
            ? false
            : { organization: query.organization_in[0] }
        )
        .modify(function (queryBuilder) {
          if (ctx.params.projectId && !sendHeaderWhereValuesCanBeWritten) {
            queryBuilder
              .join("project_donor", {
                "donors.id": "project_donor.donor",
              })
              .where({ "project_donor.project": ctx.params.projectId });
          }
        })
        .column([
          "donors.id",
          "donors.name as name",
          "donors.legal_name",
          "donors.short_name",
          "countries.name as country",
        ])
        .stream();
      stream.pipe(JSONStream.stringify()).pipe(json2csv).pipe(res);
      return await new Promise((resolve) => stream.on("end", resolve));
    } catch (error) {
      console.log(error);
      return ctx.badRequest(null, error.message);
    }
  },
  createDonorFromCsv: async (ctx) => {
    try {
      const { query } = ctx;
      const columnsWhereValueCanBeInserted = [
        "name",
        "legal_name",
        "short_name",
        "country",
      ];
      await importTable({
        columnsWhereValueCanBeInserted,
        ctx,
        tableName: "donors",
        defaultFieldsToInsert: {
          organization: query.organization_in[0],
          deleted: false,
        },
        validateRowToBeInserted,
      });
      return { message: "Donor created", done: true };
    } catch (error) {
      console.log(error);
      return ctx.badRequest(error.message);
    }
  },
};

const validateRowToBeInserted = async (rowObj) => {
  if (!rowObj.name) {
    return { valid: false, errorMessage: "name not provided" };
  }
  if (!rowObj.country) {
    return { valid: false, errorMessage: "country not provided" };
  }
  if (
    !(await isRowIdPresentInTable({
      rowId: rowObj.country,
      strapi,
      tableName: "countries",
    }))
  ) {
    return {
      valid: false,
      errorMessage: "country not valid",
    };
  }
  return { valid: true };
};
