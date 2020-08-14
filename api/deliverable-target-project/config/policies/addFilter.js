module.exports = async (ctx, next) => {
  try {
    //let orgs = await strapi.query('organization','crm-plugin').find({account: ctx.state.user.account});
    console.log(ctx.query.project);
    let project = await strapi.query('project').find({ id: ctx.query.project });
    Object.assign(ctx.query, {
      project_in: project.map(m => m.id)
    });
    return await next();
  } catch (err) {
    ctx.badRequest(`Error occured - ${err.message}`);
  }
};