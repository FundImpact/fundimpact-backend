module.exports = async (ctx, next) => {
    try {
        //let orgs = await strapi.query("organization", "crm-plugin").find({ account: ctx.state.user.account });
        //let wps = await strapi.query("workspace").find({ organization_in: orgs.map(m => m.id) });
        console.log(ctx.query)
        let projects = await strapi.query("project").find({ id :  ctx.query.project});
        Object.assign(ctx.query, {
            project_in: projects.map(m => m.id)
        });
        return await next()
    } catch (err) {
        ctx.badRequest(`Error occured - ${err.message}`);
    }
};
