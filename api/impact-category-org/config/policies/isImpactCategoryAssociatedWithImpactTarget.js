const checkIfImpactCategoryBelongToImpactTargetProject = async (
  impactCategoryId
) => {
  const knex = strapi.connections.default;
  const impactTargetProjects = await knex("impact_target_project ")
    .join("impact_category_unit", {
      "impact_category_unit.id":
        "impact_target_project.impact_category_unit",
    })
    .where({
      "impact_category_unit.impact_category_org": impactCategoryId,
      "impact_target_project.deleted": false,
    });
  if (impactTargetProjects.length) {
    return true;
  }
  return false;
};

const checkIfRequestIsToDeleteImpactCategory = (requestBody) =>
  requestBody.input.deleted;

module.exports = async (ctx, next) => {
  try {
    if (checkIfRequestIsToDeleteImpactCategory(ctx.request.body)) {
      const impactCategoryBelongToImpactTargetProject = await checkIfImpactCategoryBelongToImpactTargetProject(
        ctx.request.body.id
      );
      if (impactCategoryBelongToImpactTargetProject) {
        throw new Error(
          "Impact category associated with impact target"
        );
      }
    }
    return await next();
  } catch (err) {
    console.error(err);
    return ctx.throw(500, `Error occured - ${err.message}`);
  }
};
