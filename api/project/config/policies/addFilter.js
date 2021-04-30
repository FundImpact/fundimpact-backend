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

module.exports = async (ctx, next) => {
  try {
    const userOrganization = await getUserOrganization(ctx.state.user);
    // let orgs = await strapi.query("organization").find({
    //   account: ctx.state.user.account,
    // });
    let workspaces = await strapi.query("workspace").find({
      organization_in: userOrganization.map((m) => m.id),
    });
    Object.assign(ctx.query, {
      workspace_in: workspaces.map((m) => m.id),
    });
    const restrictedProjects = await checkIfUserIsProjectLevelUserAndGetProjectsAssigned(
      ctx.state.user
    );
    if (restrictedProjects) {
      ctx.query.id_in = restrictedProjects;
    }
    ctx.locals = {
      organizationId: userOrganization[0].id,
      restrictedProjects,
    };
    return await next();
  } catch (err) {
    console.erro("error",err);
    ctx.badRequest(`Error occured - ${err.message}`);
  }
};
