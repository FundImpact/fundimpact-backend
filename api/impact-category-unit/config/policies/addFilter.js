module.exports = async (ctx, next) => {
    try {
        let orgs = await strapi.query('organization').find({ account: ctx.state.user.account });
        // let impactCategoryOrg = await strapi.query('impact-category-org').find({ id: ctx.query.impact_category_org });
        // let deliverableCategoryOrg = await strapi.query('impact-category-org').find({ organization: orgs.map(m => m.id) });
        // let deliverableUnitsOrg = await strapi.query('impact-units-org').find({ organization: orgs.map(m => m.id) });
        const impactCategoryOrgs = await strapi.connections
          .default("impact_category_org")
          .whereIn(
            "organization",
            orgs.map((organization) => organization.id)
          );
        const impactUnitsOrgs = await strapi.connections
          .default("impact_units_org")
          .whereIn(
            "organization",
            orgs.map((organization) => organization.id)
          );
        Object.assign(ctx.query, {
            impact_category_org_in: impactCategoryOrgs.map(m => m.id),
            impact_units_org_in: impactUnitsOrgs.map(m => m.id),
        });
        ctx.locals = { organization_in: orgs.map(org => org.id ) }
        return await next();
    } catch (err) {
        console.error(err);
        ctx.badRequest(`Error occured - ${err.message}`);
    }
};