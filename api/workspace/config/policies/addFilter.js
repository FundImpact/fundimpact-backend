const getUserOrganization = async (user) => {
  const knex = strapi.connections.default;
  return await knex("organizations").where({ account: user.account });
};

const checkIfUserIsProjectLevelUserAndGetProjectsAssigned = async (user) => {
  const knex = strapi.connections.default;
  if (user.role && user.role.is_project_level === true) {
    const userProjects = await knex("user_projects").where({
      user: user.id,
    });
    return userProjects.map((userProject) => userProject.project);
  }
};

const getWorkspacesBelongingToRestrictedProjects = async (
  userRestrictedProjects
) => {
  const knex = strapi.connections.default;
  const workspaces = await knex("workspaces")
    .join("projects", {
      "workspaces.id": "projects.workspace",
    })
    .whereIn("projects.id", userRestrictedProjects)
    .select("workspaces.id");
  return workspaces.map((workspace) => workspace.id);
};

module.exports = async (ctx, next) => {
  try {
    const orgs = await getUserOrganization(ctx.state.user);
    Object.assign(ctx.query, {
      organization_in: orgs.map((m) => m.id),
    });
    const userRestrictedProjects = await checkIfUserIsProjectLevelUserAndGetProjectsAssigned(
      ctx.state.user
    );
    if (userRestrictedProjects) {
      const restrictedWorkspaces = await getWorkspacesBelongingToRestrictedProjects(
        userRestrictedProjects
      );
      ctx.query.id_in = restrictedWorkspaces;
    }
    return await next();
  } catch (err) {
    console.error(err);
    ctx.badRequest(`Error occured - ${err.message}`);
  }
};
