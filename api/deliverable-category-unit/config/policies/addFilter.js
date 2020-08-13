module.exports = async (ctx, next) => {
    try {
        let deliverableUnitOrg = await strapi.query('deliverable-category-org').find({ id: ctx.query.deliverable_category_org });
        Object.assign(ctx.query, {
            deliverable_category_org: deliverableUnitOrg.map(m => m.id)
        });
        return await next();
    } catch (err) {
        ctx.badRequest(`Error occured - ${err.message}`);
    }
};