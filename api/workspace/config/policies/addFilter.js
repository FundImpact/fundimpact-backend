module.exports = async (ctx, next) => {
    try{
        let orgs = await strapi.query('organisation').find({
            account: ctx.state.user.account.id
        });
        Object.assign(ctx.query, {
            organisation_in: orgs.map(m => m.id)
        });
        return await next();
    }catch(err){
        ctx.badRequest(`Error occured - ${err.message}`);
    }
};