"use strict";

/**
 * Read the documentation (https://strapi.io/documentation/v3.x/concepts/services.html#core-services)
 * to customize this service
 */

module.exports = {
  checkIfUserHasAccessToProject: async (
    organizationId,
    projectId,
    userRestrictedProjects
  ) => {
    console.log(`userRestrictedProjects`, userRestrictedProjects)
    if (userRestrictedProjects) {
      return userRestrictedProjects.some(
        (userRestrictedProject) => userRestrictedProject == projectId
      );
    }
    const knex = strapi.connections.default;
    const projects = await knex("organizations")
      .join("workspaces", { "workspaces.organization": "organizations.id" })
      .join("projects", { "projects.workspace": "workspaces.id" })
      .where({ "organizations.id": organizationId, "projects.id": projectId });
    return projects && projects.length;
  },
};
