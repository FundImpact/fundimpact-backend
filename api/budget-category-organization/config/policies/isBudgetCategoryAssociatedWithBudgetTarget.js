const checkIfBudgetCategoryBelongToBudgetTargetProject = async (
  budgetCategoryId
) => {
  const knex = strapi.connections.default;
  const budgetTargetProjects = await knex("budget_targets_project").where({
    budget_category_organization: budgetCategoryId,
    deleted: false,
  });
  if (budgetTargetProjects.length) {
    return true;
  }
  return false;
};

const checkIfRequestIsToDeleteBudgetCategory = (requestBody) => requestBody.input.deleted; 

module.exports = async (ctx, next) => {
  try {
    if(checkIfRequestIsToDeleteBudgetCategory(ctx.request.body)){
      const budgetCategoryBelongToBudgetTargetProject = await checkIfBudgetCategoryBelongToBudgetTargetProject(
        ctx.request.body.id
      );
      if (budgetCategoryBelongToBudgetTargetProject) {
        throw new Error("Budget category associated with budget target");
      }
    }
    return await next();
  } catch (err) {
    console.error(err);
    return ctx.throw(500, `Error occured - ${err.message}`);
  }
};
