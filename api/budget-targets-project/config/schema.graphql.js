const _ = require('lodash');
module.exports = {
  definition: `
  `,
  query: `
    projectBudgetTargets(sort: String , limit: Int, start: Int, where: JSON): [BudgetTargetsProject]
    projectBudgetTargetsCount(where : JSON) : Int!
    projectBudgetTargetAmountSum(where : JSON) : Float!
    projectExpenditureValue(where : JSON) : JSON!
    projectAllocationValue(where : JSON) : JSON!
    donorsAllocationValue(where : JSON) : JSON!
    donorsRecievedValue(where : JSON) : JSON!
    completedProjectCount(where : JSON) : JSON!
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
        return await strapi.services['budget-targets-project'].totalTargetExpense(context);
      },
      projectExpenditureValue: {
        policies: ['application::budget-targets-project.addFilter'],
        resolverOf: 'application::budget-targets-project.budget-targets-project.project_expenditure_value',
        resolver: async (obj, options, { context }) => {
          context.params = _.toPlainObject(options);
          context.request.body = _.toPlainObject(options.input);
          return await strapi.controllers['budget-targets-project'].project_expenditure_value(context);
        }
      },
      projectAllocationValue: {
        policies: ['application::budget-targets-project.addFilter'],
        resolverOf: 'application::budget-targets-project.budget-targets-project.project_allocation_value',
        resolver: async (obj, options, { context }) => {
          context.params = _.toPlainObject(options);
          context.request.body = _.toPlainObject(options.input);
          return await strapi.controllers['budget-targets-project'].project_allocation_value(context);
        }
      },
      completedProjectCount: {
        policies: ['application::budget-targets-project.addFilter'],
        resolverOf: 'application::budget-targets-project.budget-targets-project.completed_project_count',
        resolver: async (obj, options, { context }) => {
          context.params = _.toPlainObject(options);
          context.request.body = _.toPlainObject(options.input);
          return await strapi.controllers['budget-targets-project'].completed_project_count(context);
        }
      },
      donorsAllocationValue: {
        policies: ['application::budget-targets-project.addFilter'],
        resolverOf: 'application::budget-targets-project.budget-targets-project.donors_allocation_value',
        resolver: async (obj, options, { context }) => {
          context.params = _.toPlainObject(options);
          context.request.body = _.toPlainObject(options.input);
          return await strapi.controllers['budget-targets-project'].donors_allocation_value(context);
        }
      },
      donorsRecievedValue: {
        policies: ['application::budget-targets-project.addFilter'],
        resolverOf: 'application::budget-targets-project.budget-targets-project.donors_recieved_value',
        resolver: async (obj, options, { context }) => {
          context.params = _.toPlainObject(options);
          context.request.body = _.toPlainObject(options.input);
          return await strapi.controllers['budget-targets-project'].donors_recieved_value(context);
        }
      },
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