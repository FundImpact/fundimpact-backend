const checkIfDeliverableCategoryBelongToDeliverableTargetProject = async (
  deliverableCategoryId
) => {
  const knex = strapi.connections.default;
  const deliverableTargetProjects = await knex("deliverable_target_project")
    .join("deliverable_category_org", {
      "deliverable_category_org.id":
        "deliverable_target_project.deliverable_category_org",
    })
    .where({
      "deliverable_category_org.id": deliverableCategoryId,
      "deliverable_target_project.deleted": false,
    });
  if (deliverableTargetProjects.length) {
    return true;
  }
  return false;
};

const checkIfRequestIsToDeleteDeliverableCategory = (requestBody) =>
  requestBody.input.deleted;

module.exports = async (ctx, next) => {
  try {
    if (checkIfRequestIsToDeleteDeliverableCategory(ctx.request.body)) {
      const deliverableCategoryBelongToDeliverableTargetProject = await checkIfDeliverableCategoryBelongToDeliverableTargetProject(
        ctx.request.body.id
      );
      if (deliverableCategoryBelongToDeliverableTargetProject) {
        throw new Error(
          "Deliverable category associated with deiverable target"
        );
      }
    }
    return await next();
  } catch (err) {
    console.error(err);
    return ctx.throw(500, `Error occured - ${err.message}`);
  }
};
