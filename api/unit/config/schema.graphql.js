const _ = require('lodash');
module.exports = {
  definition: `
  `,
  query: `
    unitList(sort: String , limit: Int, start: Int, where: JSON): [Unit]
  `,
  mutation: `
        createUnitInput(input: UnitInput): Unit!,
        updateUnitInput(id: ID!, input: UnitInput): Unit!
    `,
  resolver: {
    Query: {
      unitList: {
        resolver: 'application::unit.unit.find'
      }
    },
    Mutation: {
      createUnitInput: async (obj, options, {
        context
      }) => {
        context.params = _.toPlainObject(options);
        context.request.body = _.toPlainObject(options.input);
        return await strapi.controllers['unit'].create(context);
      },
      updateUnitInput: async (obj, options, {
        context
      }) => {
        context.params = _.toPlainObject(options);
        context.request.body = _.toPlainObject(options.input);
        return await strapi.controllers['unit'].update(context);
      }
    }
  },

}