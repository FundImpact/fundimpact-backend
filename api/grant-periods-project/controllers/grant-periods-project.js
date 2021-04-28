"use strict";

/**
 * Read the documentation (https://strapi.io/documentation/v3.x/concepts/controllers.html#core-controllers)
 * to customize this controller
 */
const { importTable } = require("../../../services/importTable");

const JSONStream = require("JSONStream");
const { Transform } = require("json2csv");
var isValid = require('date-fns/isValid')

module.exports = {
  exportTable: async (ctx) => {
    try {
      const { res, params, query } = ctx;
      if (
        !isProjectIdAvailableInUserProjects(query.project_in, params.projectId)
      ) {
        throw new Error("Project not assigned to user");
      }
      const sendHeaderWhereValuesCanBeWritten = query.header;
      const tableColumns = sendHeaderWhereValuesCanBeWritten
        ? [
            "name *",
            "short_name",
            "description",
            "start_date * (YYYY-MM-DD)",
            "end_date * (YYYY-MM-DD)",
            "donor *",
          ]
        : ["id", "name", "donor", "start date", "end date"]; 
      const transformOpts = { highWaterMark: 16384, encoding: "utf-8" };
      const json2csv = new Transform(
        {
          fields: tableColumns,
        },
        transformOpts
      );
      ctx.set("Content-Disposition", `attachment; filename="budget.csv"`);
      ctx.set("Content-Type", "text/csv");
      ctx.body = ctx.req.pipe;
      const grantPeriodProjectStream = strapi.connections
        .default("grant_periods_project")
        .join("donors", {
          [`donors.id`]: "grant_periods_project.donor",
        })
        .column([
          "grant_periods_project.id",
          "grant_periods_project.name",
          "donors.name as donor",
          "grant_periods_project.start_date as start date",
          "grant_periods_project.end_date as end date",
        ])
        .where(
          sendHeaderWhereValuesCanBeWritten
            ? false
            : {
                project: params.projectId,
                ["grant_periods_project.deleted"]: false,
              }
        )
        .stream();
      grantPeriodProjectStream.pipe(JSONStream.stringify()).pipe(json2csv).pipe(res);
      return await new Promise((resolve) => grantPeriodProjectStream.on("end", resolve));
    } catch (error) {
      console.log(error);
      return ctx.badRequest(null, error.message);
    }
  },
  createGrantPeriodsProjectFromCsv: async (ctx) => {
    try {
      const { query, params } = ctx;
      if (
        !checkIfGivenProjectBelongToUser(query.project_in, params.projectId)
      ) {
        throw new Error("Project doesnot belong to user");
      }
      const columnsWhereValueCanBeInserted = [
        "name",
        "short_name",
        "description",
        "start_date",
        "end_date",
        "donor",
      ];
      const validateRowToBeInserted = async (rowObj) =>
        await validateRowToBeInsertedInGrantPeriodProject(
          rowObj,
          params.projectId
        );
      await importTable({
        columnsWhereValueCanBeInserted,
        ctx,
        tableName: "grant_periods_project",
        validateRowToBeInserted,
        defaultFieldsToInsert: { project: params.projectId, deleted: false },
      });
      return { message: "Grant Period Created", done: true };
    } catch (error) {
      console.log(error);
      return ctx.badRequest(null, error.message);
    }
  },
};

const isProjectIdAvailableInUserProjects = (userProjects, projectId) =>
  userProjects.some((userProject) => userProject == projectId);

const validateRowToBeInsertedInGrantPeriodProject = async (
  rowObj,
  projectId
) => {
  const requiredFields = ["name", "donor", "start_date", "end_date"];
  for (let field of requiredFields) {
    if (!rowObj[field]) {
      return {
        valid: false,
        errorMessage: `${field} not present`,
      };
    }
  }
  if (!isValid(new Date(rowObj.start_date))) {
    return { valid: false, errorMessage: "start_date not valid" };
  }
  if (!isValid(new Date(rowObj.end_date))) {
    return { valid: false, errorMessage: "end_date not valid" };
  }
  const projectDonor = await strapi.connections
    .default("project_donor")
    .where({ donor: rowObj.donor, project: projectId });
  if (!projectDonor.length) {
    return { valid: false, errorMessage: "donor not valid" };
  }
  return { valid: true };
};

const checkIfGivenProjectBelongToUser = (userProjects, projectId) =>
  !!userProjects.find((userProject) => userProject == projectId);
