"use strict";

/**
 * Read the documentation (https://strapi.io/documentation/v3.x/concepts/controllers.html#core-controllers)
 * to customize this controller
 */
const { importTable } = require("../../../services/importTable");
const { isRowIdPresentInTable } = require("../../../utils");
const {
  getQueryForDeliverableTargetProjectTargetValueSumForEachProject,
  getQueryForDeliverableTracklineValueSumForEachProject,
} = require("../../deliverable-category-org/services/deliverable-category-org");

const JSONStream = require("JSONStream");
const { Transform } = require("json2csv");

module.exports = {
  deliverable_achieved: async (ctx) => {
    try {
      const knex = strapi.connections.default;
      let data = await knex({
        dtp_sum_table: getQueryForDeliverableTargetProjectTargetValueSumForEachProject(
          ctx.query
        ),
      })
        .join(
          {
            dtl_sum_table: getQueryForDeliverableTracklineValueSumForEachProject(
              ctx.query
            ),
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
      const tableColumns = sendHeaderWhereValuesCanBeWritten
        ? ["name *", "description", "target_value *", "deliverable_category_unit *"]
        : ["id", "name", "category", "target", "achieved", "progress"];
      const deliverableTargetTransformOpts = {
        highWaterMark: 16384,
        encoding: "utf-8",
      };
      const json2csv = new Transform(
        {
          fields: tableColumns,
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
        defaultFieldsToInsert: { project: params.projectId, deleted: false, },
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
  const requiredColumns = [
    "name",
    "target_value",
    "deliverable_category_unit",
  ];

  for (let column of requiredColumns) {
    if (!rowObj[column]) {
      return { valid: false, errorMessage: `${column} not present` };
    }
  }

  if (isNaN(rowObj.target_value)) {
    return { valid: false, errorMessage: "target_value is not a number" };
  }

  if (
    !(await isRowIdPresentInTable({
      rowId: rowObj.deliverable_category_unit,
      strapi,
      tableName: "deliverable_category_unit",
    }))
  ) {
    return {
      valid: false,
      errorMessage: "deliverable_category_unit not valid",
    };
  }
  return { valid: true };
};

const checkIfProjectBelongToUser = (userProjects, projectId) =>
  !!userProjects.find((userProject) => userProject == projectId);
