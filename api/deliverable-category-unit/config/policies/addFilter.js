module.exports = async (ctx, next) => {
    try {
        let deliverableUnitOrg = await strapi.query('deliverable-category-unit').find({ deliverable_category_org: ctx.query.deliverable_category_org });
        Object.assign(ctx.query, {
            deliverable_units_org: deliverableUnitOrg.map(m => m.id)
        });
        return await next();
    } catch (err) {
        ctx.badRequest(`Error occured - ${err.message}`);
    }
};