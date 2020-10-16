module.exports = async (ctx, next) => {
    try {
      let org = await strapi.query('organization','crm-plugin').find({account: ctx.state.user.account});
      let workspace = await strapi.query("workspace").find({organization_in:org.map(m => m.id)});
      let project = await strapi.query("project").find({workspace_in:workspace.map(m => m.id)});
      
      if (ctx.state.user.role && ctx.state.user.role.is_project_level === true) {
        let userProjects = await strapi.query("user-project").find({ user: ctx.state.user.id });
        projects = userProjects.map(m => m.project)
      }
      Object.assign(ctx.query, {
        project_in: project.map(m => m.id)
      });
      return await next();
    } catch (err) {
      ctx.badRequest(`Error occured - ${err.message}`);
    }
  };