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
  deliverable_achieved: async (ctx) => {
    try {
      const knex = strapi.connections.default;
      let data = await knex({
        dtp_sum_table: knex
          .select(
            "projects.id",
            "projects.name",
            knex.raw("sum(dtp.target_value) as dtp_sum")
          )
          .from("workspaces")
          .join("projects", { "workspaces.id": "projects.workspace" })
          .join("deliverable_target_project as dtp", {
            "dtp.project": "projects.id",
          })
          .where({
            "workspaces.organization": ctx.query.organization,
            "dtp.deleted": false,
          })
          .groupBy("projects.id"),
      })
        .join(
          {
            dtl_sum_table: knex
              .select(
                "projects.id",
                "projects.name",
                knex.raw("sum(dtl.value) as dtl_sum")
              )
              .from("workspaces")
              .join("projects", { "workspaces.id": "projects.workspace" })
              .join("deliverable_target_project as dtp", {
                "dtp.project": "projects.id",
              })
              .join("deliverable_tracking_lineitem as dtl", {
                "dtl.deliverable_target_project": "dtp.id",
              })
              .leftJoin("financial_year", {
                "financial_year.id": "dtl.financial_year",
              })
              .leftJoin("annual_year", {
                "annual_year.id": "dtl.annual_year",
              })
              .where({
                "workspaces.organization": ctx.query.organization,
                "dtp.deleted": false,
                "dtl.deleted": false,
              })
              .modify(function (queryBuilder) {
                if (
                  ctx.query.financial_year &&
                  ctx.query.financial_year.length
                ) {
                  queryBuilder.whereIn(
                    "financial_year.id",
                    ctx.query.financial_year
                  );
                }
                if (ctx.query.annual_year && ctx.query.annual_year.length) {
                  queryBuilder.whereIn("annual_year.id", ctx.query.annual_year);
                }
              })
              .groupBy("projects.id"),
          },
          { "dtl_sum_table.id": "dtp_sum_table.id" }
        )
        .select(
          "dtl_sum_table.id",
          "dtl_sum_table.name",
          knex.raw(
            `ROUND((dtl_sum_table.dtl_sum/dtp_sum_table.dtp_sum)*100) as avg_value`
          )
        )
        .orderBy("avg_value", "desc");
      return data;
    } catch (error) {
      console.log(error);
      return ctx.badRequest(null, error.message);
    }
  },
  exportTable: async (ctx) => {
    try {
      const { res, params, query } = ctx;
      if (
        !isProjectIdAvailableInUserProjects(query.project_in, params.projectId)
      ) {
        throw new Error("Project not assigned to user");
      }
      const sendHeaderWhereValuesCanBeWritten = query.header;
      const tableColumnsToShow = sendHeaderWhereValuesCanBeWritten
        ? ["name", "description", "target_value", "deliverable_category_unit"]
        : ["id", "name", "category", "target", "achieved", "progress"];
      const deliverableTargetTransformOpts = {
        highWaterMark: 16384,
        encoding: "utf-8",
      };
      const json2csv = new Transform(
        {
          fields: tableColumnsToShow,
        },
        deliverableTargetTransformOpts
      );
      ctx.body = ctx.req.pipe;
      ctx.set("Content-Disposition", `attachment; filename="budget.csv"`);
      ctx.set("Content-Type", "text/csv");
      const deliverableTargetProjectStream = strapi.connections
        .default("deliverable_target_project")
        .join("deliverable_category_unit", {
          [`deliverable_target_project.deliverable_category_unit`]: "deliverable_category_unit.id",
        })
        .join("deliverable_category_org", {
          [`deliverable_category_unit.deliverable_category_org`]: "deliverable_category_org.id",
        })
        .join("deliverable_unit_org", {
          [`deliverable_category_unit.deliverable_units_org`]: "deliverable_unit_org.id",
        })
        .leftJoin("deliverable_tracking_lineitem", {
          ["deliverable_target_project.id"]:
            "deliverable_tracking_lineitem.deliverable_target_project",
        })
        .groupBy("deliverable_target_project.id")
        .groupBy("deliverable_category_org.id")
        .groupBy("deliverable_unit_org.id")
        .column([
          "deliverable_target_project.id",
          "deliverable_target_project.name as name",
          "deliverable_category_org.name as category",
          strapi.connections.default.raw(
            `concat(deliverable_target_project.target_value, ' ', deliverable_unit_org.name) as target`
          ),
          strapi.connections.default.raw(
            `concat(sum(deliverable_tracking_lineitem.value), ' ', deliverable_unit_org.name) as achieved`
          ),
          strapi.connections.default.raw(
            `sum(deliverable_tracking_lineitem.value) / deliverable_target_project.target_value * 100 as progress`
          ),
        ])
        .where(
          sendHeaderWhereValuesCanBeWritten
            ? false
            : {
                project: params.projectId,
                ["deliverable_target_project.deleted"]: false,
              }
        )
        .stream();
      deliverableTargetProjectStream
        .pipe(JSONStream.stringify())
        .pipe(json2csv)
        .pipe(res);
      return await new Promise((resolve) =>
        deliverableTargetProjectStream.on("end", resolve)
      );
    } catch (error) {
      console.log(error);
      return ctx.badRequest(null, error.message);
    }
  },
  createDeliverableTargetProjectFromCsv: async (ctx) => {
    try {
      const { query, params } = ctx;
      const projectBelongToUser = checkIfProjectBelongToUser(
        query.project_in,
        params.projectId
      );
      if (!projectBelongToUser) {
        throw new Error("Project is not assigned to user");
      }
      const columnsWhereValueCanBeInserted = [
        "name",
        "description",
        "target_value",
        "deliverable_category_unit",
      ];
      const validateRowToBeInserted = async (rowObj) =>
        await validateRowToBeInsertedInDeliverableTargetProject(rowObj);

      await importTable({
        columnsWhereValueCanBeInserted,
        ctx,
        tableName: "deliverable_target_project",
        defaultFieldsToInsert: { project: params.projectId },
        validateRowToBeInserted,
      });
      return { message: "Deliverable Target Created", done: true };
    } catch (error) {
      console.log(error);
      return ctx.badRequest(null, error.message);
    }
  },
};

const isProjectIdAvailableInUserProjects = (userProjects, projectId) =>
  userProjects.some((userProject) => userProject == projectId);

const validateRowToBeInsertedInDeliverableTargetProject = async (rowObj) => {
  const areRequiredColumnsPresent = [
    "name",
    "target_value",
    "deliverable_category_unit",
  ].every((column) => !!rowObj[column]);

  if (!areRequiredColumnsPresent) {
    return false;
  }
  if (
    !(await isRowIdPresentInTable({
      rowId: rowObj.deliverable_category_unit,
      strapi,
      tableName: "deliverable_category_unit",
    }))
  ) {
    return false;
  }
  return true;
};

const checkIfProjectBelongToUser = (userProjects, projectId) =>
  !!userProjects.find((userProject) => userProject == projectId);
