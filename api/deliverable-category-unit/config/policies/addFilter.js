module.exports = async (ctx, next) => {
    try {
        let deliverableCategoryOrg = await strapi.query('deliverable-category-org').find({ id: ctx.query.deliverable_category_org });
        let deliverableUnitsOrg = await strapi.query('deliverable-units-org').find({ id: ctx.query.deliverable_units_org });
        
        Object.assign(ctx.query, {
            deliverable_category_org_in: deliverableCategoryOrg.map(m => m.id),
            deliverable_units_org_in : deliverableUnitsOrg.map(m => m.id)
        });
        return await next();
    } catch (err) {
        ctx.badRequest(`Error occured - ${err.message}`);
    }
};