const checkIfRequestIsToDeleteDonor = (requestBody) =>
  requestBody.input.deleted;

const checkIfDonorBelongToProjectDonor = async (donorId) => {
  const knex = strapi.connections.default;
  const projectDonor = await knex("project_donor").where({ donor: donorId });
  return projectDonor && projectDonor.length;
};

module.exports = async (ctx, next) => {
  try {
    if (checkIfRequestIsToDeleteDonor(ctx.request.body)) {
      const donorBelongsToProjectDonor = await checkIfDonorBelongToProjectDonor(
        ctx.request.body.id
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
