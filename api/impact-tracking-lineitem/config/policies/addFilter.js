module.exports = async (ctx, next) => {
    try {
      let orgs = await strapi.query('organization','crm-plugin').find({account: ctx.state.user.account});
      let impactCategoryOrg = await strapi.query('impact-category-org').find({organization: orgs.map(m => m.id)});
      let impactCategoryunit = await strapi.query('impact-category-unit').find({impact_category_org: impactCategoryOrg.map(m => m.id)});
      let impactTargetProject = await strapi.query('impact-target-project').find({impact_category_unit: impactCategoryunit.map(m => m.id)});
      
      Object.assign(ctx.query, {
        impact_target_project_in: impactTargetProject.map(m => m.id)
      });
      return await next();
    } catch (err) {
      ctx.badRequest(`Error occured - ${err.message}`);
    }
  };