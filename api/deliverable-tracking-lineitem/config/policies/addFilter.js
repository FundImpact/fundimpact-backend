module.exports = async (ctx, next) => {
  try {
    let orgs = await strapi.query('organization').find({ account: ctx.state.user.account });
    let deliverableCategoryOrg = await strapi.connections
      .default("deliverable_category_org")
      .whereIn(
        "organization",
        orgs.map((m) => m.id)
      );
    let deliverableCategoryunit = await strapi.connections
      .default("deliverable_category_unit")
      .whereIn(
        "deliverable_category_org",
        deliverableCategoryOrg.map((m) => m.id)
      );
    let deliverableTargetProject = await strapi.connections
      .default("deliverable_target_project")
      .whereIn(
        "deliverable_category_unit",
        deliverableCategoryunit.map((m) => m.id)
      );
    if (ctx.state.user.role && ctx.state.user.role.is_project_level === true) {
      let userProjects = await strapi.query("user-project").find({ user: ctx.state.user.id });
      deliverableTargetProject = await strapi.connections
        .default("deliverable_target_project")
        .whereIn(
          "project",
          userProjects.map((m) => m.project.id)
        );
    }
    Object.assign(ctx.query, {
      deliverable_target_project_in: deliverableTargetProject.map(m => m.id),
      deleted: false
    });
    return await next();
  } catch (err) {
    console.log(`err`, err)
    ctx.badRequest(`Error occured - ${err.message}`);
  }
};