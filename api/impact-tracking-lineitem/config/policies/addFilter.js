module.exports = async (ctx, next) => {
    try {
      let impactTargetProject = await strapi.query('impact-target-project').find({ id: ctx.query.impact_target_project });
      Object.assign(ctx.query, {
        impact_target_project_in: impactTargetProject.map(m => m.id)
      });
      return await next();
    } catch (err) {
      ctx.badRequest(`Error occured - ${err.message}`);
    }
  };