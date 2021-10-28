const checkIfDeliverableUnitBelongToDeliverableTargetProject = async (
  deliverableUnitId
) => {
  const knex = strapi.connections.default;
  const deliverableTargetProjects = await knex("deliverable_target_project ")
    .join("deliverable_unit_org", {
      "deliverable_unit_org.id":
        "deliverable_target_project.deliverable_unit_org",
    })
    .where({
      "deliverable_unit_org.id": deliverableUnitId,
      "deliverable_target_project.deleted": false,
    });
  if (deliverableTargetProjects.length) {
    return true;
  }
  return false;
};

const checkIfRequestIsToDeleteDeliverableUnit = (requestBody) =>
  requestBody.input.deleted;

module.exports = async (ctx, next) => {
  try {
    if (checkIfRequestIsToDeleteDeliverableUnit(ctx.request.body)) {
      const deliverableUnitBelongToDeliverableTargetProject = await checkIfDeliverableUnitBelongToDeliverableTargetProject(
        ctx.request.body.id
      );
      if (deliverableUnitBelongToDeliverableTargetProject) {
        throw new Error("Deliverable unit associated with deiverable target");
      }
    }
    return await next();
  } catch (err) {
    console.error(err);
    return ctx.throw(500, `Error occured - ${err.message}`);
  }
};
