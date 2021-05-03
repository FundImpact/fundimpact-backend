module.exports = async (ctx, next) => {
    try {
        let orgs = await strapi.query("organization").find({ account: ctx.state.user.account });
        Object.assign(ctx.query, {
            organization_in: orgs.map(m => m.id),
            deleted: false
        });
        return await next();
    } catch (err) {
        ctx.badRequest(`Error occured - ${err.message}`);
    }
};
