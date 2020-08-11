module.exports = async (ctx, next) => {
    try{
        let orgs = await strapi.plugins['crm-plugin'].controllers.organization.find(ctx);
        Object.assign(ctx.query, {
            organization_in: orgs.map(m => m.id)
        });
        return await next();
    }catch(err){
        ctx.badRequest(`Error occured - ${err.message}`);
    }
};
