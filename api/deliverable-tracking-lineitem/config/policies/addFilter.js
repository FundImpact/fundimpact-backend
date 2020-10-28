module.exports = async (ctx, next) => {
  try {
    let orgs = await strapi.query('organization').find({ account: ctx.state.user.account });
    let deliverableCategoryOrg = await strapi.query('deliverable-category-org').find({ organization: orgs.map(m => m.id) });
    let deliverableCategoryunit = await strapi.query('deliverable-category-unit').find({ deliverable_category_org: deliverableCategoryOrg.map(m => m.id) });
    let deliverableTargetProject = await strapi.query('deliverable-target-project').find({ deliverable_category_unit: deliverableCategoryunit.map(m => m.id) });

    if (ctx.state.user.role && ctx.state.user.role.is_project_level === true) {
      let userProjects = await strapi.query("user-project").find({ user: ctx.state.user.id });
      deliverableTargetProject = await strapi.query('deliverable-target-project').find({ project: userProjects.map(m => m.project) });
    }
    Object.assign(ctx.query, {
      deliverable_target_project_in: deliverableTargetProject.map(m => m.id)
    });
    console.log(ctx.query);
    return await next();
  } catch (err) {
    ctx.badRequest(`Error occured - ${err.message}`);
  }
};