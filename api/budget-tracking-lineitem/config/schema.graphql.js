const _ = require('lodash');
module.exports = {
  definition: `
  `,
  query: `
        projBudgetTrackings(sort: String , limit: Int, start: Int, where: JSON): [BudgetTrackingLineitem]
        projBudgetTrackingsCount(where : JSON) : Int!
        projBudgetTrackingsTotalAmount(where : JSON) : Float!
        projBudgetTrackingsTotalSpendAmount(where : JSON) : Float!
  `,
  mutation: `
        createProjBudgetTracking(input: BudgetTrackingLineitemInput): BudgetTrackingLineitem!,
        updateProjBudgetTracking(id: ID!, input: BudgetTrackingLineitemInput): BudgetTrackingLineitem!
    `,
  resolver: {
    Query: {
      projBudgetTrackings: {
        policies: ['application::budget-tracking-lineitem.addFilter'],
        resolver: 'application::budget-tracking-lineitem.budget-tracking-lineitem.find'
      },
      projBudgetTrackingsCount: {
        policies: ['application::budget-tracking-lineitem.addFilter'],
        resolver: 'application::budget-tracking-lineitem.budget-tracking-lineitem.count'
      },
      projBudgetTrackingsTotalAmount: async (obj, options, { context }) => {
        context.params = _.toPlainObject(options);
        context.request.body = _.toPlainObject(options.input);
        return await strapi.services['budget-tracking-lineitem'].spendAmount(context);
      },
      projBudgetTrackingsTotalSpendAmount: async (obj, options, { context }) => {
        context.params = _.toPlainObject(options);
        context.request.body = _.toPlainObject(options.input);
        return await strapi.services['budget-tracking-lineitem'].totalSpendAmountByProject(context);
      },

    },
    Mutation: {
      createProjBudgetTracking: async (obj, options, {
        context
      }) => {
        context.params = _.toPlainObject(options);
        context.request.body = _.toPlainObject(options.input);
        return await strapi.controllers['budget-tracking-lineitem'].create(context);
      },
      updateProjBudgetTracking: async (obj, options, {
        context
      }) => {
        context.params = _.toPlainObject(options);
        context.request.body = _.toPlainObject(options.input);
        return await strapi.controllers['budget-tracking-lineitem'].update(context);
      }
    }
  },

}