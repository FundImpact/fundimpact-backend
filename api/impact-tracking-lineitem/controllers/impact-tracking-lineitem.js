"use strict";

/**
 * Read the documentation (https://strapi.io/documentation/v3.x/concepts/controllers.html#core-controllers)
 * to customize this controller
 */
 const { importTable } = require("../../../services/importTable");
 const { isRowIdPresentInTable } = require("../../../utils");

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
  createImpactTrackingLineitemFromCsv: async (ctx) => {
    try {
      const { query, params } = ctx;
      const columnsWhereValueCanBeInserted = [
        "impact_target_project",
        "grant_periods_project",
        "value",
        "note",
        "reporting_date",
        "financial_year",
        "annual_year",
      ];
      console.log(`query`, query)
      //Todo move this to middleware
      const impactTargetProjectBelongToUser = checkIfImpactTargetProjectBelongToUser(
        query.impact_target_project_in,
        params.impactTargetProjectId
      );
      if (!impactTargetProjectBelongToUser) {
        throw new Error("Impact Target Project Doesnot Belong To User");
      }

      await importTable({
        columnsWhereValueCanBeInserted,
        ctx,
        tableName: "impact_tracking_lineitem",
        validateRowToBeInserted: validateRowToBeInsertedInImpactLineItem,
        defaultFieldsToInsert: {
          impact_target_project: params.impactTargetProjectId,
        },
      });
      return { message: "Impact Lineitem Created", done: true };
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
 
 const checkIfImpactTargetProjectBelongToUser = (
   userImpactTargetProjects,
   impactTargetProjectId
 ) =>
   !!userImpactTargetProjects.find(
     (userImpactTargetProject) =>
       userImpactTargetProject == impactTargetProjectId
   );
 
 const validateRowToBeInsertedInImpactLineItem = async (rowObj) => {
   const areRequiredColumnsPresent = ["reporting_date", "value"].every(
     (column) => !!rowObj[column]
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
   const foreignKeys = [
     { tableName: "grant_periods_project", columnName: "grant_periods_project" },
     { tableName: "annual_year", columnName: "annual_year" },
     { tableName: "financial_year", columnName: "financial_year" },
   ];
   for (let i = 0; i < foreignKeys.length; i++) {
     const { tableName, columnName } = foreignKeys[i];
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
 
