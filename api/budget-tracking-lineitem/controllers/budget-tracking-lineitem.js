"use strict";

/**
 * Read the documentation (https://strapi.io/documentation/v3.x/concepts/controllers.html#core-controllers)
 * to customize this controller
 */

const JSONStream = require("JSONStream");
const { Transform } = require("json2csv");

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
        .where({ budget_targets_project: params.budgetTargetsProjectId })
        .stream();
      stream.pipe(JSONStream.stringify()).pipe(json2csv).pipe(res);
      return await new Promise((resolve) => stream.on("end", resolve));
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
