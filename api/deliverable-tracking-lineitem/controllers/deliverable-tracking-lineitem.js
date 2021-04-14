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
        !isDeliverableTargetsProjectIdAvailableInUserDeliverableTargetProjects(
          query.deliverable_target_project_in,
          params.deliverableTargetsProjectId
        )
      ) {
        throw new Error("Deliverable Target Project Not Assigned To User");
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
      ctx.set("Content-Disposition", `attachment; filename="budget.csv"`);
      ctx.set("Content-Type", "text/csv");
      ctx.body = ctx.req.pipe;
      const deliverableTrackingLineitemStream = strapi.connections
        .default("deliverable_tracking_lineitem")
        .join("deliverable_target_project", {
          [`deliverable_tracking_lineitem.deliverable_target_project`]: "deliverable_target_project.id",
        })
        .leftJoin("financial_year", {
          ["financial_year.id"]: "deliverable_tracking_lineitem.financial_year",
        })
        .join("deliverable_category_unit", {
          [`deliverable_target_project.deliverable_category_unit`]: "deliverable_category_unit.id",
        })
        .join("deliverable_unit_org", {
          [`deliverable_category_unit.deliverable_units_org`]: "deliverable_unit_org.id",
        })
        .leftJoin("annual_year", {
          ["annual_year.id"]: "deliverable_tracking_lineitem.annual_year",
        })
        .column([
          "deliverable_tracking_lineitem.id",
          "deliverable_tracking_lineitem.reporting_date as date",
          "deliverable_tracking_lineitem.note as note",
          strapi.connections.default.raw(
            `concat(deliverable_tracking_lineitem.value, ' ', deliverable_unit_org.name) as achieved`
          ),
          "annual_year.name as annual year",
          "financial_year.name as financial year",
        ])
        .where({
          deliverable_target_project: params.deliverableTargetsProjectId,
        })
        .stream();
      deliverableTrackingLineitemStream.pipe(JSONStream.stringify()).pipe(json2csv).pipe(res);
      return await new Promise((resolve) => deliverableTrackingLineitemStream.on("end", resolve));
    } catch (error) {
      console.log(error);
      return ctx.badRequest(null, error.message);
    }
  },
  createDeliverableTrackingLineitemFromCsv: async (ctx) => {
    try {
      const { query, params } = ctx;
      const columnsWhereValueCanBeInserted = [
        "deliverable_target_project",
        "grant_periods_project",
        "value",
        "note",
        "reporting_date",
        "financial_year",
        "annual_year",
      ];
      //Todo move this to middleware
      const deliverableTargetProjectBelongToUser = checkIfDeliverableTargetProjectBelongToUser(
        query.deliverable_target_project_in,
        params.deliverableTargetProjectId
      );
      if (!deliverableTargetProjectBelongToUser) {
        throw new Error("Deliverable Target Project Doesnot Belong To User");
      }

      await importTable({
        columnsWhereValueCanBeInserted,
        ctx,
        tableName: "deliverable_tracking_lineitem",
        validateRowToBeInserted: validateRowToBeInsertedInDeliverableLineItem,
        defaultFieldsToInsert: {
          deliverable_target_project: params.deliverableTargetProjectId,
        },
      });
      return { message: "Deliverable Lineitem Created", done: true };
    } catch (error) {
      console.log(error);
      return ctx.badRequest(null, error.message);
    }
  },
}

const isDeliverableTargetsProjectIdAvailableInUserDeliverableTargetProjects = (
  userDeliverableTargetProjects,
  deliverableTargetsProjectId
) =>
  userDeliverableTargetProjects.some(
    (userDeliverableTargetProject) =>
      userDeliverableTargetProject == deliverableTargetsProjectId
  );
const checkIfDeliverableTargetProjectBelongToUser = (
  userDeliverableTargetProjects,
  deliverableTargetProjectId
) =>
  !!userDeliverableTargetProjects.find(
    (userDeliverableTargetProject) =>
      userDeliverableTargetProject == deliverableTargetProjectId
  );

const validateRowToBeInsertedInDeliverableLineItem = async (rowObj) => {
  const areRequiredColsPresent = ["reporting_date", "value"].every(
    (column) => !!rowObj[column]
  );
  if (!areRequiredColsPresent) {
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
    { tableName: "financial_year", columnName: "financial_year" },
  ];
  for (let i = 0; i < budgetTrackingLineitemForeignKeys.length; i++) {
    const { tableName, columnName } = budgetTrackingLineitemForeignKeys[i];
    const foreignKeyInvalid =
      rowObj[columnName] &&
      !(await isRowIdPresentInTable({
        tableName,
        strapi,
        rowId: rowObj[columnName],
      }));
    if (foreignKeyInvalid) {
      return false;
    }
  }
  return true;
};
