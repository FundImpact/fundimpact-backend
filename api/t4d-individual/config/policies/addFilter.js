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
    const knex = strapi.connections.default;
    let orgs = await knex("organizations").where({
      account: ctx.state.user.account,
    });
    Object.assign(ctx.query, {
      deleted: false,
    });
    ctx.locals = {
      restrictedProjects: await checkIfUserIsProjectLevelUserAndGetProjectsAssigned(
        ctx.state.user
      ),
      organizationId: orgs[0].id,
    };
    return await next();
  } catch (error) {
    console.log(error);
    ctx.badRequest(`Error occured - ${err.message}`);
  }
};
