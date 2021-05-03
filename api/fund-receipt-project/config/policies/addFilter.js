module.exports = async (ctx, next) => {
    try{
        let orgs = await strapi.query('organization').find({ account: ctx.state.user.account });
        let projects = await strapi.query("project").find({id : ctx.query.project});
        let project_donors = await strapi.query("project-donor").find({project_in:projects.map(m => m.id)});
        delete ctx.query.project
        Object.assign(ctx.query, {
            project_donor_in: project_donors.map(m => m.id),
            deleted: false
        });
        const workspaces = await strapi.connections
          .default("workspaces")
          .where({ organization: orgs[0].id });
        const projectAssignedToUser = await strapi.connections
          .default("projects")
          .whereIn(
            "workspace",
            workspaces.map((workspace) => workspace.id)
          );
        ctx.locals = {};
        ctx.locals.project_in = projectAssignedToUser.map(project => project.id)
        return await next();
    }catch(err){
        ctx.badRequest(`Error occured - ${err.message}`);
    }
};
