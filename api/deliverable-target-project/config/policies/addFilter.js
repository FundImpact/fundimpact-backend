module.exports = async (ctx, next) => {
  try {
    //let orgs = await strapi.query('organization','crm-plugin').find({account: ctx.state.user.account});
    console.log("project" , ctx.query)
    let deliverableCategoryOrg = await strapi.query('deliverable-target-project').find({project: ctx.query.project});
    Object.assign(ctx.query, {
      deliverable_category_org: deliverableCategoryOrg.map(m => m.id)
    });
    return await next();
  } catch (err) {
    ctx.badRequest(`Error occured - ${err.message}`);
  }
};