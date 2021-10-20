const _ = require('lodash');
module.exports = {
  definition: `
    type DonorBudget{
      id:ID!
      name:String
      allocated:Float
      recieved:Float
    }
  `,
  query: `
    donorsBudget:[DonorBudget]
    `,
  mutation: `
    `,
  resolver: {
    Query: {
      donorsBudget:{
        resolver:'application::dashboard.dashboard-budget.donors'
      }
    },
    Mutation: {
      
    }
  },

}