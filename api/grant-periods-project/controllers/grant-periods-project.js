"use strict";

/**
 * Read the documentation (https://strapi.io/documentation/v3.x/concepts/controllers.html#core-controllers)
 * to customize this controller
 */
const { importTable } = require("../../../services/importTable");

const JSONStream = require("JSONStream");
const { Transform } = require("json2csv");

module.exports = {
  exportTable: async (ctx) => {
    try {
      const { res, params, query } = ctx;
      if (
        !isProjectIdAvailableInUserProjects(query.project_in, params.projectId)
      ) {
        throw new Error("Project not assigned to user");
      }
      const transformOpts = { highWaterMark: 16384, encoding: "utf-8" };
      const json2csv = new Transform(
        {
          fields: ["id", "donor", "start date", "end date"],
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
          "donors.name as donor",
          "grant_periods_project.start_date as start date",
          "grant_periods_project.end_date as end date",
        ])
        .where({ project: params.projectId })
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
        defaultFieldsToInsert: { project: params.projectId },
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
  const areAllRequiredFieldsPresent = [
    "name",
    "donor",
    "start_date",
    "end_date",
  ].every((column) => !!rowObj[column]);
  if (!areAllRequiredFieldsPresent) {
    return false;
  }
  const projectDonor = await strapi.connections
    .default("project_donor")
    .where({ donor: rowObj.donor, project: projectId });
  if (!projectDonor.length) {
    return false;
  }
  return true;
};

const checkIfGivenProjectBelongToUser = (userProjects, projectId) =>
  !!userProjects.find((userProject) => userProject == projectId);
