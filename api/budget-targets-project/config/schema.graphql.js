const _ = require('lodash');
module.exports = {
    definition: `
  `,
    query: `
    projectBudgetTargets(where: JSON): [BudgetTargetsProject]
  `,
    mutation:`
        createProjectBudgetTarget(input: BudgetTargetsProjectInput): BudgetTargetsProject!,
        updateProjectBudgetTarget(id: ID!, input: BudgetTargetsProjectInput): BudgetTargetsProject!
    `,
    resolver: {
        Query: {
          projectBudgetTargets: {
               policies: ['application::budget-targets-project.addFilter'],
                resolver: 'application::budget-targets-project.budget-targets-project.find'
            }
        },
        Mutation: {
          createProjectBudgetTarget: async (obj, options, {
                context
            }) => {
                context.params = _.toPlainObject(options);
                context.request.body = _.toPlainObject(options.input);
                return await strapi.controllers['budget-targets-project'].create(context);
            },
            updateProjectBudgetTarget: async (obj, options, {
              context
            }) => {
              context.params = _.toPlainObject(options);
              context.request.body = _.toPlainObject(options.input);
              return await strapi.controllers['budget-targets-project'].update(context);
            }
        }
    },
    
}