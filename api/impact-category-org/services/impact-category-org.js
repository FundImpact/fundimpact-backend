"use strict";

/**
 * Read the documentation (https://strapi.io/documentation/v3.x/concepts/services.html#core-services)
 * to customize this service
 */

const getQueryForImpactTargetProjectTargetValueSumForEachProject = (
  userQuery
) => {
  const knex = strapi.connections.default;
  return knex
    .select(
      "projects.id",
      "projects.name",
      knex.raw("sum(itp.target_value) as itp_sum")
    )
    .from("workspaces")
    .join("projects", { "workspaces.id": "projects.workspace" })
    .join("impact_target_project as itp", {
      "itp.project": "projects.id",
    })
    .where({
      "workspaces.organization": userQuery.organization,
      "itp.deleted": false,
    })
    .groupBy("projects.id");
};

const getQueryForImpactTracklineValueSumForEachProject = (userQuery) => {
  const knex = strapi.connections.default;

  return knex
    .select(
      "projects.id",
      "projects.name",
      knex.raw("sum(itl.value) as itl_sum")
    )
    .from("workspaces")
    .join("projects", { "workspaces.id": "projects.workspace" })
    .join("impact_target_project as itp", {
      "itp.project": "projects.id",
    })
    .join("impact_tracking_lineitem as itl", {
      "itl.impact_target_project": "itp.id",
    })
    .leftJoin("financial_year", {
      "financial_year.id": "itl.financial_year",
    })
    .leftJoin("annual_year", {
      "annual_year.id": "itl.annual_year",
    })
    .where({
      "workspaces.organization": userQuery.organization,
      "itp.deleted": false,
      "itl.deleted": false,
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
  getQueryForImpactTargetProjectTargetValueSumForEachProject,
  getQueryForImpactTracklineValueSumForEachProject,
};
