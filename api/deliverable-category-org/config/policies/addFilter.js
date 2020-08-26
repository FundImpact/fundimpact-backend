module.exports = async (ctx, next) => {
    try {
        let orgs = await strapi.query("organization", "crm-plugin").find({account:ctx.state.user.account});
        Object.assign(ctx.query, {
            organization_in: orgs.map(m => m.id)
        });
        return await next();
    } catch (err) {
        console.log(err);
        ctx.badRequest(`Error occured - ${err.message}`);
    }
};
