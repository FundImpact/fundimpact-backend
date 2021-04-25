"use strict";

/**
 * Read the documentation (https://strapi.io/documentation/v3.x/concepts/services.html#core-services)
 * to customize this service
 */

const getQueryForDeliverableTargetProjectTargetValueSumForEachProject = (
  userQuery
) => {
  const knex = strapi.connections.default;
  return knex
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
      "workspaces.organization": userQuery.organization,
      "dtp.deleted": false,
    })
    .groupBy("projects.id");
};

const getQueryForDeliverableTracklineValueSumForEachProject = (userQuery) => {
  const knex = strapi.connections.default;

  return knex
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
      "workspaces.organization": userQuery.organization,
      "dtp.deleted": false,
      "dtl.deleted": false,
    })
    .modify(function (queryBuilder) {
      if (userQuery.financial_year && userQuery.financial_year.length) {
        queryBuilder.whereIn("financial_year.id", userQuery.financial_year);
      }
      if (userQuery.annual_year && userQuery.annual_year.length) {
        queryBuilder.whereIn("annual_year.id", userQuery.annual_year);
      }
    })
    .groupBy("projects.id");
};

module.exports = {
  getQueryForDeliverableTargetProjectTargetValueSumForEachProject,
  getQueryForDeliverableTracklineValueSumForEachProject,
};
