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
        !isImpactTargetsProjectIdAvailableInUserImpactTargetProjects(
          query.impact_target_project_in,
          params.impactTargetsProjectId
        )
      ) {
        throw new Error("Impact Target Project Not Assigned To User");
      }
      const transformOpts = { highWaterMark: 16384, encoding: "utf-8" };
      const json2csv = new Transform(
        {
          fields: [
            "id",
            "date",
            "note",
            "achieved",
            "annual year",
            "financial year",
          ],
        },
        transformOpts
      );
      ctx.body = ctx.req.pipe;
      ctx.set("Content-Disposition", `attachment; filename="budget.csv"`);
      ctx.set("Content-Type", "text/csv");
      const impactTrackingLineitemStream = strapi.connections
        .default("impact_tracking_lineitem")
        .join("impact_target_project", {
          [`impact_tracking_lineitem.impact_target_project`]: "impact_target_project.id",
        })
        .join("impact_category_unit", {
          [`impact_target_project.impact_category_unit`]: "impact_category_unit.id",
        })
        .join("impact_units_org", {
          [`impact_category_unit.impact_units_org`]: "impact_units_org.id",
        })
        .leftJoin("financial_year", {
          ["financial_year.id"]: "impact_tracking_lineitem.financial_year",
        })
        .leftJoin("annual_year", {
          ["annual_year.id"]: "impact_tracking_lineitem.annual_year",
        })
        .column([
          "impact_tracking_lineitem.id",
          "impact_tracking_lineitem.reporting_date as date",
          "impact_tracking_lineitem.note as note",
          strapi.connections.default.raw(
            `concat(impact_tracking_lineitem.value, ' ', impact_units_org.name) as achieved`
          ),
          "annual_year.name as annual year",
          "financial_year.name as financial year",
        ])
        .where({
          impact_target_project: params.impactTargetsProjectId,
        })
        .stream();
      impactTrackingLineitemStream.pipe(JSONStream.stringify()).pipe(json2csv).pipe(res);
      return await new Promise((resolve) => impactTrackingLineitemStream.on("end", resolve));
    } catch (error) {
      console.log(error);
      return ctx.badRequest(null, error.message);
    }
  },
};

const isImpactTargetsProjectIdAvailableInUserImpactTargetProjects = (
  userImpactTargetProjects,
  impactTargetsProjectId
) =>
  userImpactTargetProjects.some(
    (userImpactTargetProject) =>
      userImpactTargetProject == impactTargetsProjectId
  );
