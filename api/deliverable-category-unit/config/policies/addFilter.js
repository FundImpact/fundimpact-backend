module.exports = async (ctx, next) => {
    try {
      console.log("ctx.state.user" ,ctx.state.user)  
      let orgs = await strapi.query('organization','crm-plugin').find({account: ctx.state.user.account});
      let deliverableCategoryOrg = await strapi.query('deliverable-category-org').find({organization: orgs.map(m => m.id)});
      let deliverableUnitOrg = await strapi.query('deliverable-category-unit').find({deliverable_category_org: deliverableCategoryOrg.map(m => m.id)});
      Object.assign(ctx.query, {
        deliverable_units_org: deliverableUnitOrg.map(m => m.id)
      });
      return await next();
    } catch (err) {
      ctx.badRequest(`Error occured - ${err.message}`);
    }
  };