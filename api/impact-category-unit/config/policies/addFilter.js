module.exports = async (ctx, next) => {
    try {
        let orgs = await strapi.query('organization').find({ account: ctx.state.user.account });
        let impactCategoryOrg = await strapi.query('impact-category-org').find({ id: ctx.query.impact_category_org });
        Object.assign(ctx.query, {
            impact_category_org_in: impactCategoryOrg.map(m => m.id)
        });
        ctx.locals = { organization_in: orgs.map(org => org.id ) }
        return await next();
    } catch (err) {
        ctx.badRequest(`Error occured - ${err.message}`);
    }
};