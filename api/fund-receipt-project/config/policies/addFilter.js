module.exports = async (ctx, next) => {
    try{
        let projects = await strapi.query("project").find({id : ctx.query.project});
        let project_donors = await strapi.query("project-donor").find({project_in:projects.map(m => m.id)});
        delete ctx.query.project
        Object.assign(ctx.query, {
            project_donor_in: project_donors.map(m => m.id)
        });
        return await next();
    }catch(err){
        ctx.badRequest(`Error occured - ${err.message}`);
    }
};
