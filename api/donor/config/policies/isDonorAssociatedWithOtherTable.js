const {
  checkIfDonorBelongToProjectDonor,
  checkIfDonorBelongToTableProvided,
} = require("../../services/donor");

const checkIfRequestIsToDeleteDonor = (requestBody) =>
  requestBody.input.deleted;

module.exports = async (ctx, next) => {
  try {
    if (checkIfRequestIsToDeleteDonor(ctx.request.body)) {
      const [
        donorBelongsToProjectDonor,
        donorBelongToBudgetTarget,
        // donorBelongToDeliverableLineItemFyDonor,
        // donorBelongToImpactLineItemFyDonor,
        donorBelongToGrantPeriod,
        donorBelongToFundReceiptProject,
      ] = await Promise.all([
        checkIfDonorBelongToProjectDonor(ctx.request.body.id, ctx),
        checkIfDonorBelongToTableProvided(
          "budget_targets_project",
          ctx.request.body.id
        ),
        // checkIfDonorBelongToTableProvided(
        //   "deliverable_lineitem_fy_donor",
        //   ctx.request.body.id
        // ),
        // checkIfDonorBelongToTableProvided(
        //   "impact_linitem_fy_donor",
        //   ctx.request.body.id
        // ),
        checkIfDonorBelongToTableProvided(
          "grant_periods_project",
          ctx.request.body.id
        ),
        checkIfDonorBelongToTableProvided(
          "fund_receipt_project",
          ctx.request.body.id
        ),
      ]);
      if (donorBelongsToProjectDonor) {
        throw new Error("Donor Is Associated With A Project");
      }
      if (donorBelongToBudgetTarget) {
        throw new Error("Donor Belong To Budget Target");
      }
      // if (donorBelongToDeliverableLineItemFyDonor) {
      //   throw new Error("Donor Belong To Deliverable LineItem");
      // }
      // if (donorBelongToImpactLineItemFyDonor) {
      //   throw new Error("Donor Belong To Impact LineItem");
      // }
      if (donorBelongToGrantPeriod) {
        throw new Error("Donor Belong To Grant Period");
      }
      if (donorBelongToFundReceiptProject) {
        throw new Error("Donor Belong To Fund Received");
      }
    }
    return await next();
  } catch (error) {
    console.error(error);
    ctx.throw(500, error.message);
  }
};
