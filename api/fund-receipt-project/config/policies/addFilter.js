module.exports = async (ctx, next) => {
    try{
        let project = await strapi.query("project").find({id:ctx.query.project});
        let donor = await strapi.query("donor").find({id:ctx.query.donor});
        Object.assign(ctx.query, {
            project_in: project.map(m => m.id),
            donor_in: donor.map(m => m.id)
        });
        return await next();
    }catch(err){
        ctx.badRequest(`Error occured - ${err.message}`);
    }
};
