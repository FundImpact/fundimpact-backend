module.exports = async (ctx, next) => {
  try {
    const knex = strapi.connections.default;
    const orgs = await knex("organizations").where(
      "account",
      ctx.state.user.account
    );
    const wps = await knex("workspaces").whereIn(
      "organization",
      orgs.map((m) => m.id)
    );
    const projects = await knex("projects").whereIn(
      "workspace",
      wps.map((m) => m.id)
    );
    const donors = await knex("donors").whereIn(
      "organization",
      orgs.map((m) => m.id)
    );
    Object.assign(ctx.query, {
      project_in: projects.map((m) => m.id),
      donor_in: donors.map((m) => m.id),
      deleted: false,
    });
    Object.keys(ctx.query).forEach((key) =>
      Array.isArray(ctx.query[key]) && ctx.query[key].length == 0
        ? delete ctx.query[key]
        : ctx.query[key]
    );
    return await next();
  } catch (err) {
    ctx.badRequest(`Error occured - ${err.message}`);
  }
};
