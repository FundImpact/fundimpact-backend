module.exports = async (ctx, next) => {
  try {
    let orgs = await strapi.query('organization').find({ account: ctx.state.user.account });
    let impactCategoryOrg = await strapi.query('impact-category-org').find({ organization: orgs.map(m => m.id) });
    let impactCategoryunit = await strapi.query('impact-category-unit').find({ impact_category_org: impactCategoryOrg.map(m => m.id) });
    let impactTargetProject = await strapi.query('impact-target-project').find({ impact_category_unit: impactCategoryunit.map(m => m.id) });

    if (ctx.state.user.role && ctx.state.user.role.is_project_level === true) {
      let userProjects = await strapi.query("user-project").find({ user: ctx.state.user.id });
      impactTargetProject = await strapi.query('impact-target-project').find({ impact_category_unit: userProjects.map(m => m.project) });
    }

    Object.assign(ctx.query, {
      impact_target_project_in: impactTargetProject.map(m => m.id),
      deleted: false
    });
    return await next();
  } catch (err) {
    ctx.badRequest(`Error occured - ${err.message}`);
  }
};