const _ = require('lodash');
module.exports = {
  definition: `
  `,
  query: `
    projBudgetTargetDonors(sort: String , limit: Int, start: Int, where: JSON): [BudgetTargetsDonor]
    projBudgetTargetDonorsCount(where : JSON) : Int!
   
  `,
  mutation: `
        createProjBudgetTargetDonor(input: BudgetTargetsDonorInput): BudgetTargetsDonor!,
        updateProjBudgetTargetDonor(id: ID!, input: BudgetTargetsDonorInput): BudgetTargetsDonor!
    `,
  resolver: {
    Query: {
      projBudgetTargetDonors: {
        policies: ['application::budget-targets-donor.addFilter'],
        resolver: 'application::budget-targets-donor.budget-targets-donor.find'
      },
      projBudgetTargetDonorsCount: {
        policies: ['application::budget-targets-donor.addFilter'],
        resolver: 'application::budget-targets-donor.budget-targets-donor.count'
      }
    },
    Mutation: {
      createProjBudgetTargetDonor:{
        resolverOf:'application::budget-targets-donor.budget-targets-donor.create',
        resolver: async (obj, options, {context}) => {
          context.params = _.toPlainObject(options);
          context.request.body = _.toPlainObject(options.input);
          return await strapi.controllers['budget-targets-donor'].create(context);
        },
      },
      updateProjBudgetTargetDonor: {
        resolverOf:'application::budget-targets-donor.budget-targets-donor.update',
        resolver :  async (obj, options, { context }) => {
          context.params = _.toPlainObject(options);
          context.request.body = _.toPlainObject(options.input);
          return await strapi.controllers['budget-targets-donor'].update(context);
        }
      }
    }
  },

}