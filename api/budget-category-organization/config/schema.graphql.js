const _ = require('lodash');
module.exports = {
    definition: `
  `,
    query: `
    orgBudgetCategory(sort: String , limit: Int, start: Int, where: JSON): [BudgetCategoryOrganization]
    orgBudgetCategoryCount(where : JSON) : Int!
  `,
    mutation:`
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