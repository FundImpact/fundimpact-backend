module.exports = async (ctx, next) => {
  try {
    let orgs = await strapi
      .query("organization")
      .find({ account: ctx.state.user.account });
    let wps = await strapi
      .query("workspace")
      .find({ organization_in: orgs.map((m) => m.id) });
    let projects = await strapi
      .query("project")
      .find({ workspace_in: wps.map((m) => m.id) });
    let donors = await strapi
      .query("donor")
      .find({ organization_in: orgs.map((m) => m.id), _limit: 1000 });
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
