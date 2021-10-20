"use strict";

/**
 * Read the documentation (https://strapi.io/documentation/v3.x/concepts/controllers.html#core-controllers)
 * to customize this controller
 */

const JSONStream = require("JSONStream");
const { Transform } = require("json2csv");
const { checkIfUserHasAccessToProject } = require("../services/t4d-individual");
const LineByLineReader = require("line-by-line");

module.exports = {
  exportTable: async (ctx) => {
    try {
      const { res, locals, params, query } = ctx;
      if (
        params.projectId &&
        !(await checkIfUserHasAccessToProject(
          locals.organizationId,
          params.projectId,
          locals.restrictedProjects
        ))
      ) {
        throw new Error("Project doesnot belong to user");
      }
      const transformOpts = { highWaterMark: 16384, encoding: "utf-8" };
      let tableColumns = ["id", "name", "project"];
      if (checkIfUserWantHeaderWhereValueCanBeWritten(query)) {
        tableColumns = getTableColumnsWhereValueCanBeWritten(params);
      }
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
        .default("t4d_individuals")
        .leftJoin("t4d_project_individuals", {
          [`t4d_project_individuals.t4d_individual`]: "t4d_individuals.id",
        })
        .leftJoin("projects", {
          "projects.id": "t4d_project_individuals.project",
        })
        .column([
          "t4d_individuals.id as id",
          "t4d_individuals.name as name",
          "projects.name as project",
        ])
        .where(
          checkIfUserWantHeaderWhereValueCanBeWritten(query)
            ? false
            : {
                "t4d_individuals.organization": locals.organizationId,
                "t4d_individuals.deleted": false,
              }
        )
        .modify(function (queryBuilder) {
          if (params.projectId) {
            queryBuilder.where("projects.id", params.projectId);
          } else if (locals.restrictedProjects) {
            queryBuilder.whereIn("projects.id", locals.restrictedProjects);
          }
        })
        .stream();
      stream.pipe(JSONStream.stringify()).pipe(json2csv).pipe(res);
      return await new Promise((resolve, reject) => {
        stream.on("end", resolve);
        stream.on("error", reject);
      });
    } catch (error) {
      console.log(error);
      return ctx.badRequest(error.message);
    }
  },
  createT4dIndividualFromCsv: async (ctx) => {
    try {
      const { params, request, locals } = ctx;
      if (
        params.projectId &&
        !(await checkIfUserHasAccessToProject(
          locals.organizationId,
          params.projectId,
          locals.restrictedProjects
        ))
      ) {
        throw new Error("Project doesnot belong to user");
      }

      let csvHeader = null;
      var destinationPath = request.files.importTable.path;
      var lr = new LineByLineReader(destinationPath);
      const colsWhereValueCanBeInserted = ["name"];
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
            const rowObj = await getRowObjToBeInserted(
              csvHeader,
              line,
              colsWhereValueCanBeInserted,
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
            await insertRowsInT4dIndividualTable(rowObjsToBeInserted);
            resolve();
          } catch (err) {
            lr.emit("error", err);
          }
        });
        lr.on("error", (error) => reject(error));
      });
      return { message: "Individual Created", done: true };
    } catch (error) {
      console.log(error);
      return ctx.badRequest(error.message);
    }
  },
};

const insertRowsInT4dIndividualTable = async (rowObjsToBeInserted) => {
  for (let rowObj of rowObjsToBeInserted) {
    const { project } = rowObj;
    delete rowObj.project;
    await strapi.connections
      .default("t4d_individuals")
      .insert(rowObj)
      .returning("id")
      .then(
        ([t4dIndividualId]) =>
          project &&
          strapi.connections.default("t4d_project_individuals").insert({
            project,
            t4d_individual: t4dIndividualId,
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
    { organization: ctx.locals.organizationId, deleted: false }
  );
  const projectId =
    ctx.params.projectId ||
    getColumnValueFromRowToBeInserted("project", rowToInsert, tableColumns);

  const isRowValid = await validateRowToBeInsertedInT4dIndividual(
    {
      ...insertObj,
      project: projectId,
    },
    ctx
  );
  if (!isRowValid.valid) {
    throw new Error(`${isRowValid.errorMessage} for row ${rowToInsert}`);
  }
  return { ...insertObj, project: projectId };
};

const validateRowToBeInsertedInT4dIndividual = async (rowObj, ctx) => {
  if (!rowObj.name) {
    return { valid: false, errorMessage: "Name not provided" };
  }
  if (
    rowObj.project &&
    !(await checkIfUserHasAccessToProject(
      ctx.locals.organizationId,
      rowObj.project,
      ctx.locals.restrictedProjects
    ))
  ) {
    return { valid: false, errorMessage: "project not valid" };
  }
  return { valid: true };
};

const checkIfUserWantHeaderWhereValueCanBeWritten = (query) => query.header;

const getTableColumnsWhereValueCanBeWritten = (params) =>
  params.projectId ? ["name *"] : ["name *", "project"];

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
