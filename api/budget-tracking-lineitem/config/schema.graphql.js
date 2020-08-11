const _ = require('lodash');
module.exports = {
    definition: `
  `,
    query: `
    projBudgetTrackings(where: JSON): [BudgetTrackingLineitem]
  `,
    mutation:`
        createProjBudgetTracking(input: BudgetTrackingLineitemInput): BudgetTrackingLineitem!,
        updateProjBudgetTracking(id: ID!, input: BudgetTrackingLineitemInput): BudgetTrackingLineitem!
    `,
    resolver: {
        Query: {
          projBudgetTrackings: {
               policies: ['application::budget-tracking-lineitem.addFilter'],
                resolver: 'application::budget-tracking-lineitem.budget-tracking-lineitem.find'
            }
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