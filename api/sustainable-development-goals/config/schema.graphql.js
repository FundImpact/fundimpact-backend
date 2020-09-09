const _ = require('lodash');
module.exports = {
  definition: `
  `,
  query: `
    sustainableDevelopmentGoalList(sort: String , limit: Int, start: Int, where: JSON): [SustainableDevelopmentGoals]
    sustainableDevelopmentGoalCount(where : JSON) : Int!
  `,
  mutation: `
        createSDG(input: SustainableDevelopmentGoalInput): SustainableDevelopmentGoals!,
        updateSDG(id: ID!, input: SustainableDevelopmentGoalInput): SustainableDevelopmentGoals!
    `,
  resolver: {
    Query: {
      sustainableDevelopmentGoalList: {
        resolver: 'application::sustainable-development-goals.sustainable-development-goals.find'
      },
      sustainableDevelopmentGoalCount: {
        resolver: 'application::sustainable-development-goals.sustainable-development-goals.count'
      }
    },
    Mutation: {
      createSDG: async (obj, options, {
        context
      }) => {
        context.params = _.toPlainObject(options);
        context.request.body = _.toPlainObject(options.input);
        return await strapi.controllers['sustainable-development-goals'].create(context);
      },
      updateSDG: async (obj, options, {
        context
      }) => {
        context.params = _.toPlainObject(options);
        context.request.body = _.toPlainObject(options.input);
        return await strapi.controllers['sustainable-development-goals'].update(context);
      }
    }
  },

}