module.exports = async (ctx, next) => {
    try{
        let country = await strapi.query("country", "crm-plugin").find({id:ctx.query.counrty});
        Object.assign(ctx.query, {
            country_in: country.map(m => m.id)
        });
        return await next();
    }catch(err){
        ctx.badRequest(`Error occured - ${err.message}`);
    }
};
