"use strict";

/**
 * Read the documentation (https://strapi.io/documentation/v3.x/concepts/services.html#core-services)
 * to customize this service
 */

const checkIfDonorBelongToProjectDonor = async (donorId, ctx) => {
  const knex = strapi.connections.default;
  let orgs = await strapi
    .query("organization")
    .find({ account: ctx.state.user.account });
  let wps = await strapi
    .query("workspace")
    .find({ organization_in: orgs.map((m) => m.id), _limit: 1000 });
  let projects = await strapi
    .query("project")
    .find({ workspace: wps.map((m) => m.id), _limit: 1000 });
  const projectDonor = await knex("project_donor")
    .where({ donor: donorId, deleted: false })
    .whereIn(
      "project",
      projects.map((project) => project.id)
    );
  return projectDonor && projectDonor.length;
};

const checkIfDonorBelongToTableProvided = async (tableName, donorId) => {
  const knex = strapi.connections.default;
  const tableRowsWithGivenDonor = await knex(tableName).where({
    donor: donorId,
    deleted: false
  });
  return tableRowsWithGivenDonor && tableRowsWithGivenDonor.length;
};

module.exports = {
  checkIfDonorBelongToProjectDonor,
  checkIfDonorBelongToTableProvided
};
