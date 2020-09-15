const _ = require('lodash');
module.exports = {
  definition: `
  `,
  query: `
    orgBudgetCategory(sort: String , limit: Int, start: Int, where: JSON): [BudgetCategoryOrganization]
    orgBudgetCategoryCount(where : JSON) : Int!
    projectCountBudgetCatByOrg(where : JSON) : JSON!  
    budgetTargetSum(where : JSON) : Float!
    budgetSpentValue(where : JSON) : Float!
  `,
  mutation: `
        createOrgBudgetCategory(input: BudgetCategoryOrganizationInput): BudgetCategoryOrganization!,
        updateOrgBudgetCategory(id: ID!, input: BudgetCategoryOrganizationInput): BudgetCategoryOrganization!
    `,
  resolver: {
    Query: {
      orgBudgetCategory: {
        policies: ['application::budget-category-organization.addFilter'],
        resolver: 'application::budget-category-organization.budget-category-organization.find'
      },
      orgBudgetCategoryCount: {
        policies: ['application::budget-category-organization.addFilter'],
        resolver: 'application::budget-category-organization.budget-category-organization.count'
      },
      projectCountBudgetCatByOrg: {
        policies: ['application::budget-category-organization.addFilter'],
        resolverOf: 'application::budget-category-organization.budget-category-organization.project_count_budget_cat',
        resolver: async (obj, options, { context }) => {
          context.params = _.toPlainObject(options);
          context.request.body = _.toPlainObject(options.input);
          return await strapi.controllers['budget-category-organization'].project_count_budget_cat(context);
        }
      },
      budgetTargetSum: {
        policies: ['application::budget-category-organization.addFilter'],
        resolverOf: 'application::budget-category-organization.budget-category-organization.budget_target_sum',
        resolver: async (obj, options, { context }) => {
          context.params = _.toPlainObject(options);
          context.request.body = _.toPlainObject(options.input);
          return await strapi.controllers['budget-category-organization'].budget_target_sum(context);
        }
      },
      budgetSpentValue: {
        policies: ['application::budget-category-organization.addFilter'],
        resolverOf: 'application::budget-category-organization.budget-category-organization.budget_spent_value',
        resolver: async (obj, options, { context }) => {
          context.params = _.toPlainObject(options);
          context.request.body = _.toPlainObject(options.input);
          return await strapi.controllers['budget-category-organization'].budget_spent_value(context);
        }
      }
    },
    Mutation: {
      createOrgBudgetCategory: async (obj, options, {
        context
      }) => {
        context.params = _.toPlainObject(options);
        context.request.body = _.toPlainObject(options.input);
        return await strapi.controllers['budget-category-organization'].create(context);
      },
      updateOrgBudgetCategory: async (obj, options, {
        context
      }) => {
        context.params = _.toPlainObject(options);
        context.request.body = _.toPlainObject(options.input);
        return await strapi.controllers['budget-category-organization'].update(context);
      }
    }
  }
}