module.exports = async (ctx, next) => {
  try {
    let orgs = await strapi.query('organization').find({
      account: ctx.state.user.account
    });
    let workspaces = await strapi.query('workspace').find({
      organization_in: orgs.map(m => m.id)
    });
    Object.assign(ctx.query, {
      workspace_in: workspaces.map(m => m.id)
    });
    return await next();
  } catch (err) {
    // console.log("error",err);
    ctx.badRequest(`Error occured - ${err.message}`);
  }
};