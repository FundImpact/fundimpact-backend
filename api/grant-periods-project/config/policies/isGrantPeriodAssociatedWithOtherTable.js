const checkIfRequestIsToDeleteGrantPeriod = (requestBody) =>
  requestBody.input.deleted;

const checkIfGrantPeriodBelongToBudgetLineItem= async (grantPeriodId) => {
  const knex = strapi.connections.default;
  const budgetTrackingLineItem = await knex("budget_tracking_lineitem").where({
    grant_periods_project: grantPeriodId,
  });
  if (budgetTrackingLineItem.length) {
    return true;
  }
  return false;
};
const checkIfGrantPeriodBelongToDeliverableLineItem = async (grantPeriodId) => {
  const knex = strapi.connections.default;
  const deliverableLineItemFyDonor = await knex(
    "deliverable_lineitem_fy_donor"
  ).where({
    grant_periods_project: grantPeriodId,
  });
  const deliverableTrackingLineItem = await knex(
    "deliverable_tracking_lineitem"
  ).where({
    grant_periods_project: grantPeriodId,
  });
  if (deliverableLineItemFyDonor.length || deliverableTrackingLineItem.length) {
    return true;
  }
  return false;
};
const checkIfGrantPeriodBelongToImpactLineItem = async (grantPeriodId) => {
  const knex = strapi.connections.default;
  const impactLineItemFyDonor = await knex("impact_linitem_fy_donor").where({
    grant_periods_project: grantPeriodId,
  });
  const impactTrackingLineItem = await knex("impact_tracking_lineitem").where({
    grant_periods_project: grantPeriodId,
  });
  if (impactLineItemFyDonor.length || impactTrackingLineItem.length) {
    return true;
  }
  return false;
};

module.exports = async (ctx, next) => {
  try {
    if (checkIfRequestIsToDeleteGrantPeriod(ctx.request.body)) {
      const grantPeriodBelongToBudgetLineItem = await checkIfGrantPeriodBelongToBudgetLineItem(
        ctx.request.body.id
      );
      if (grantPeriodBelongToBudgetLineItem) {
        throw new Error("Grant associated with budget line item");
      }
      const grantPeriodBelongToDeliverableLineItem = await checkIfGrantPeriodBelongToDeliverableLineItem(
        ctx.request.body.id
      );
      if (grantPeriodBelongToDeliverableLineItem) {
        throw new Error("Grant associated with deliverable line item");
      }
      const grantPeriodBelongToImpactLineItem = await checkIfGrantPeriodBelongToImpactLineItem(
        ctx.request.body.id
      );
      if (grantPeriodBelongToImpactLineItem) {
        throw new Error("Grant associated with impact line item");
      }
    }
    return await next();
  } catch (error) {
    console.error(error);
    ctx.throw(500, error.message);
  }
};
