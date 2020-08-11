module.exports = async (ctx, next) => {
    try{
        let orgs = await strapi.query("organization", "crm-plugin").find({account:ctx.state.user.account});
        let wps = await strapi.query("workspace").find({organization_in:orgs.map(m => m.id)});
        let projects = await strapi.query("project").find({workspace_in:wps.map(m => m.id)});
        let budgetTargets = await strapi.query("budget-targets-project").find({project_in:projects.map(m => m.id)});
        Object.assign(ctx.query, {
            budget_targets_project_in: budgetTargets.map(m => m.id)
        });
        console.log(ctx.query);
        
        return await next() 
    }catch(err){
        console.log(err);
        
        ctx.badRequest(`Error occured - ${err.message}`);
    }
};
