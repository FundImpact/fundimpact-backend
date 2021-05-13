const checkIfRequestIsToDeleteDonor = (requestBody) =>
  requestBody.input.deleted;

const checkIfDonorBelongToProjectDonor = async (donorId, ctx) => {
  const knex = strapi.connections.default;
  let orgs = await strapi
    .query("organization")
    .find({ account: ctx.state.user.account });
  let wps = await strapi
    .query("workspace")
    .find({ organization_in: orgs.map((m) => m.id), _limit: 1000 });
  let projects = await strapi
    .query("project")
    .find({ workspace: wps.map((m) => m.id), _limit: 1000 });
  const projectDonor = await knex("project_donor")
    .where({ donor: donorId })
    .whereIn(
      "project",
      projects.map((project) => project.id)
    );
  return projectDonor && projectDonor.length;
};

module.exports = async (ctx, next) => {
  try {
    if (checkIfRequestIsToDeleteDonor(ctx.request.body)) {
      const donorBelongsToProjectDonor = await checkIfDonorBelongToProjectDonor(
        ctx.request.body.id, ctx
      );
      if (donorBelongsToProjectDonor) {
        throw new Error("Donor Is Associated With A Project");
      }
    }
    return await next();
  } catch (error) {
    console.error(error);
    ctx.throw(500, error.message);
  }
};
