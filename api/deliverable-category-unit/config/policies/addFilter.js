module.exports = async (ctx, next) => {
    try {
        let orgs = await strapi.query('organization').find({ account: ctx.state.user.account });
        
        let deliverableCategoryOrg = await strapi.query('deliverable-category-org').find({ organization: orgs.map(m => m.id) });
        let deliverableUnitsOrg = await strapi.query('deliverable-units-org').find({ organization: orgs.map(m => m.id) });
        Object.assign(ctx.query, {
            deliverable_category_org_in: deliverableCategoryOrg.map(m => m.id),
            deliverable_units_org_in : deliverableUnitsOrg.map(m => m.id)
        });
        ctx.locals = { organization_in: orgs.map(org => org.id ) }
        return await next();
    } catch (err) {
        ctx.badRequest(`Error occured - ${err.message}`);
    }
};