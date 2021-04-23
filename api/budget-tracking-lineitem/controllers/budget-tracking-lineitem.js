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
      const { res, params, query } = ctx;
      if (
        !isBudgetTargetsProjectIdAvailableInUserBudgetTargetProjects(
          query.budget_targets_project_in,
          params.budgetTargetsProjectId
        )
      ) {
        throw new Error("Budget target project not assigned to user");
      }
      const transformOpts = { highWaterMark: 16384, encoding: "utf-8" };
      const json2csv = new Transform(
        {
          fields: [
            "id",
            "date",
            "note",
            "amount",
            "grant period",
            "annual year",
            "financial year org",
            "financial year donor",
          ],
        },
        transformOpts
      );
      ctx.body = ctx.req.pipe;
      ctx.set("Content-Disposition", `attachment; filename="budget.csv"`);
      ctx.set("Content-Type", "text/csv");
      const stream = strapi.connections
        .default("budget_tracking_lineitem")
        .join("budget_targets_project", {
          [`budget_tracking_lineitem.budget_targets_project`]: "budget_targets_project.id",
        })
        .leftJoin("annual_year", {
          [`budget_tracking_lineitem.annual_year`]: "annual_year.id",
        })
        .leftJoin("financial_year as financial_year_org", {
          [`budget_tracking_lineitem.fy_org`]: "financial_year_org.id",
        })
        .leftJoin("financial_year as financial_year_donor", {
          [`budget_tracking_lineitem.fy_donor`]: "financial_year_donor.id",
        })
        .leftJoin("grant_periods_project", {
          [`budget_tracking_lineitem.grant_periods_project `]: "grant_periods_project.id",
        })
        .column([
          "budget_tracking_lineitem.id",
          "budget_tracking_lineitem.reporting_date as date",
          "budget_tracking_lineitem.note",
          "budget_tracking_lineitem.amount",
          "grant_periods_project.name as grant period",
          "annual_year.name as annual year",
          "financial_year_org.name as financial year org",
          "financial_year_donor.name as financial year donor",
        ])
        .where({
          budget_targets_project: params.budgetTargetsProjectId,
          ["budget_tracking_lineitem.deleted"]: false,
        })
        .stream();
      stream.pipe(JSONStream.stringify()).pipe(json2csv).pipe(res);
      return await new Promise((resolve) => stream.on("end", resolve));
    } catch (error) {
      console.log(error);
      return ctx.badRequest(null, error.message);
    }
  },
  createBudgetTrackingLineitemFromCsv: async (ctx) => {
    try {
      const { query, params } = ctx;
      const columnsWhereValueCanBeInserted = [
        "budget_targets_project",
        "annual_year",
        "grant_periods_project",
        "amount",
        "note",
        "reporting_date",
        "fy_org",
        "fy_donor",
      ];
      //Todo move this to middleware
      const budgetTargetProjectBelongToUser = checkIfBudgetTargetProjectBelongToUser(
        query.budget_targets_project_in,
        params.budgetTargetProjectId
      );
      if (!budgetTargetProjectBelongToUser) {
        throw new Error("Budget Target Project Doesnot Belong To User");
      }

      await importTable({
        columnsWhereValueCanBeInserted,
        ctx,
        tableName: "budget_tracking_lineitem",
        validateRowToBeInserted: validateRowToBeInsertedInBudgetLineItem,
        defaultFieldsToInsert: {
          budget_targets_project: params.budgetTargetProjectId,
        },
      });
      return { message: "Budget Lineitem Created", done: true };
    } catch (error) {
      console.log(error);
      return ctx.badRequest(null, error.message);
    }
  },
};

const isBudgetTargetsProjectIdAvailableInUserBudgetTargetProjects = (
  userBudgetTargetProjects,
  budgetTargetsProjectId
) =>
  userBudgetTargetProjects.some(
    (userBudgetTargetProject) =>
      userBudgetTargetProject == budgetTargetsProjectId
  );

const checkIfBudgetTargetProjectBelongToUser = (
  userBudgetTargetProjects,
  budgetTargetProjectId
) =>
  !!userBudgetTargetProjects.find(
    (userBudgetTargetProject) =>
      userBudgetTargetProject == budgetTargetProjectId
  );

const validateRowToBeInsertedInBudgetLineItem = async (rowObj) => {
  const areRequiredColumnsPresent = ["reporting_date", "amount"].every(
    (col) => !!rowObj[col]
  );

  if (!areRequiredColumnsPresent) {
    return false;
  }

  let areForeignKeysValid = await checkIfAllTheForeignKeysToBeInsertedAreValid(
    rowObj
  );
  if (!areForeignKeysValid) {
    return false;
  }
  return true;
};

const checkIfAllTheForeignKeysToBeInsertedAreValid = async (rowObj) => {
  const budgetTrackingLineitemForeignKeys = [
    { tableName: "grant_periods_project", columnName: "grant_periods_project" },
    { tableName: "annual_year", columnName: "annual_year" },
    { tableName: "financial_year", columnName: "fy_org" },
    { tableName: "financial_year", columnName: "fy_donor" },
  ];
  for (let i = 0; i < budgetTrackingLineitemForeignKeys.length; i++) {
    const { tableName, columnName } = budgetTrackingLineitemForeignKeys[i];
    const isForeignKeyInvalid =
      rowObj[columnName] &&
      !(await isRowIdPresentInTable({
        tableName,
        strapi,
        rowId: rowObj[columnName],
      }));
    if (isForeignKeyInvalid) {
      return false;
    }
  }
  return true;
};
