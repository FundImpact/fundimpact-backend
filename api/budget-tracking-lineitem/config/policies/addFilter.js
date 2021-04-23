module.exports = async (ctx, next) => {
    try{
        let orgs = await strapi.query("organization").find({account:ctx.state.user.account});
        let wps = await strapi.query("workspace").find({organization_in:orgs.map(m => m.id)});
        let projects = await strapi.query("project").find({workspace_in:wps.map(m => m.id)});


        if(ctx.state.user.role && ctx.state.user.role.is_project_level === true){
            let userProjects = await strapi.query("user-project").find({ user : ctx.state.user.id });
            projects  = userProjects.map(m => m.project)
        }
        
        let budgetTargets = await strapi.query("budget-targets-project").find({project_in:projects.map(m => m.id)});
        
        Object.assign(ctx.query, {
            budget_targets_project_in: budgetTargets.map(m => m.id),
            deleted: false
        });
        return await next() 
    }catch(err){
        ctx.badRequest(`Error occured - ${err.message}`);
    }
};
