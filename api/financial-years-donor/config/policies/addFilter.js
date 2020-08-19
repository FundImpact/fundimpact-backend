module.exports = async (ctx, next) => {
    try {
        let orgs = await strapi.query("organization", "crm-plugin").find({ account: ctx.state.user.account });
        let donors = await strapi.query("donor").find({ organization_in: orgs.map(m => m.id) });
        Object.assign(ctx.query, {
            donor_in: donors.map(m => m.id)
        });
        return await next()
    } catch (err) {
        ctx.badRequest(`Error occured - ${err.message}`);
    }
};
