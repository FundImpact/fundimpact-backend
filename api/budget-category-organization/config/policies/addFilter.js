module.exports = async (ctx, next) => {
    try{
        let orgs = await strapi.query("organization", "crm-plugin").find({account:ctx.state.user.account});
        orgs = orgs.map(m => m.id)
        Object.assign(ctx.query, {
            organization_in: ctx.state.user.role && ctx.state.user.role.is_project_level === true ? [] : orgs
        });
        return await next() 
    }catch(err){
        ctx.badRequest(`Error occured - ${err.message}`);
    }
};
