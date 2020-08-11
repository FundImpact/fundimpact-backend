const _ = require('lodash');
module.exports = {
    definition: `
  `,
    query: `
    projBudgetTargetDonors(where: JSON): [BudgetTargetsDonor]
  `,
    mutation:`
        createProjBudgetTargetDonor(input: BudgetTargetsDonorInput): BudgetTargetsDonor!,
        updateProjBudgetTargetDonor(id: ID!, input: BudgetTargetsDonorInput): BudgetTargetsDonor!
    `,
    resolver: {
        Query: {
          projBudgetTargetDonors: {
               policies: ['application::budget-targets-donor.addFilter'],
                resolver: 'application::budget-targets-donor.budget-targets-donor.find'
            }
        },
        Mutation: {
          createProjBudgetTargetDonor: async (obj, options, {
                context
            }) => {
                context.params = _.toPlainObject(options);
                context.request.body = _.toPlainObject(options.input);
                return await strapi.controllers['budget-targets-donor'].create(context);
            },
            updateProjBudgetTargetDonor: async (obj, options, {
              context
            }) => {
              context.params = _.toPlainObject(options);
              context.request.body = _.toPlainObject(options.input);
              return await strapi.controllers['budget-targets-donor'].update(context);
            }
        }
    },
    
}