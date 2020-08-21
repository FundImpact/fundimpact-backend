const _ = require('lodash');
module.exports = {
  definition: `
  `,
  query: `
    projectBudgetTargets(sort: String , limit: Int, start: Int, where: JSON): [BudgetTargetsProject]
    projectBudgetTargetsCount(where : JSON) : Int!
    projectBudgetTargetAmountSum(where : JSON) : Float!
  `,
  mutation: `
        createProjectBudgetTarget(input: BudgetTargetsProjectInput): BudgetTargetsProject!,
        updateProjectBudgetTarget(id: ID!, input: BudgetTargetsProjectInput): BudgetTargetsProject!
    `,
  resolver: {
    Query: {
      projectBudgetTargets: {
        policies: ['application::budget-targets-project.addFilter'],
        resolver: 'application::budget-targets-project.budget-targets-project.find'
      },
      projectBudgetTargetsCount: {
        policies: ['application::budget-targets-project.addFilter'],
        resolver: 'application::budget-targets-project.budget-targets-project.count'
      },
      projectBudgetTargetAmountSum: async (obj, options, {
        context
      }) => {
        context.params = _.toPlainObject(options);
        context.request.body = _.toPlainObject(options.input);
       
        //return await strapi.controllers['budget-targets-project'].sumTarget(context);
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