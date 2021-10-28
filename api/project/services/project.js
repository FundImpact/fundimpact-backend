"use strict";

/**
 * Read the documentation (https://strapi.io/documentation/v3.x/concepts/services.html#core-services)
 * to customize this service
 */
const { tables } = require("../../../utils/tables");

const deleteRowsInTableWithGivenProjectId = async (tableName, projectId) => {
  const knex = strapi.connections.default;
  const deletedTableRows = await knex(tableName)
    .where({ project: projectId })
    .update({ deleted: true }, ["id"]);
  return deletedTableRows;
};

const deleteAllTheTablesInAProject = async (projectId) => {
  const knex = strapi.connections.default;
  const [
    budgetTargetProjects,
    deliverableTargetProjects,
    impactTargetProjects,
  ] = await Promise.all([
    deleteRowsInTableWithGivenProjectId(
      tables.budget_targets_project,
      projectId
    ),
    deleteRowsInTableWithGivenProjectId(
      tables.deliverable_target_project,
      projectId
    ),
    deleteRowsInTableWithGivenProjectId(
      tables.impact_target_project,
      projectId
    ),
    deleteRowsInTableWithGivenProjectId(
      tables.grant_periods_project,
      projectId
    ),
    deleteRowsInTableWithGivenProjectId(
      tables.t4d_project_individuals,
      projectId
    ),
    deleteRowsInTableWithGivenProjectId(tables.project_donor, projectId),
  ]);
  await knex(tables.budget_tracking_lineitem)
    .whereIn(
      tables.budget_targets_project,
      budgetTargetProjects.map((budgetTargetProject) => budgetTargetProject.id)
    )
    .update({ deleted: true }, ["id"]);

  const deliverableTrackingLineItems = await knex(
    tables.deliverable_tracking_lineitem
  )
    .whereIn(
      tables.deliverable_target_project,
      deliverableTargetProjects.map(
        (deliverableTargetProject) => deliverableTargetProject.id
      )
    )
    .update({ deleted: true }, ["id"]);

  await knex(tables.deliverable_lineitem_fy_donor)
    .update({ deleted: true })
    .whereIn(
      tables.deliverable_tracking_lineitem,
      deliverableTrackingLineItems.map(
        (deliverableTrackingLineItem) => deliverableTrackingLineItem.id
      )
    );
  const impactTrackingLineItems = await knex(tables.impact_tracking_lineitem)
    .whereIn(
      tables.impact_target_project,
      impactTargetProjects.map((impactTargetProject) => impactTargetProject.id)
    )
    .update({ deleted: true }, ["id"]);

  await knex(tables.impact_linitem_fy_donor)
    .update({ deleted: true })
    .whereIn(
      tables.impact_tracking_lineitem,
      impactTrackingLineItems.map(
        (impactTrackingLineItem) => impactTrackingLineItem.id
      )
    );
  await knex(tables.fund_receipt_project)
    .update({ deleted: true })
    .whereIn(
      `${tables.fund_receipt_project}.${tables.project_donor}`,
      knex(tables.project_donor).select("id").where({ project: projectId })
    );
};

module.exports = { deleteAllTheTablesInAProject };
