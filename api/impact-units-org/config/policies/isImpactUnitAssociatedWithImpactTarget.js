const checkIfImpactUnitBelongToImpactTargetProject = async (
  impactUnitId
) => {
  const knex = strapi.connections.default;
  const impactTargetProjects = await knex("impact_target_project ")
    .join("impact_category_unit", {
      "impact_category_unit.id":
        "impact_target_project.impact_category_unit",
    })
    .where({
      "impact_category_unit.impact_units_org": impactUnitId,
      deleted: false,
    });
  if (impactTargetProjects.length) {
    return true;
  }
  return false;
};

const checkIfRequestIsToDeleteImpactUnit = (requestBody) =>
  requestBody.input.deleted;

module.exports = async (ctx, next) => {
  try {
    if (checkIfRequestIsToDeleteImpactUnit(ctx.request.body)) {
      const impactUnitBelongToImpactTargetProject = await checkIfImpactUnitBelongToImpactTargetProject(
        ctx.request.body.id
      );
      if (impactUnitBelongToImpactTargetProject) {
        throw new Error(
          "Impact unit associated with impact target"
        );
      }
    }
    return await next();
  } catch (err) {
    console.error(err);
    return ctx.throw(500, `Error occured - ${err.message}`);
  }
};
