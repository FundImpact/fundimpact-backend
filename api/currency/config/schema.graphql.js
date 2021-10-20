const _ = require('lodash');
module.exports = {
  definition: `
  `,
  query: `
    currencyList(sort: String , limit: Int, start: Int, where: JSON): [Currency]
  `,
  mutation: `
        createCurrencyInput(input: CurrencyInput): Currency!,
        updateCurrencyInput(id: ID!, input: editCurrencyInput): Currency!
    `,
  resolver: {
    Query: {
      currencyList: {
        resolver: 'application::currency.currency.find'
      }
    },
    Mutation: {
      createCurrencyInput: async (obj, options, {
        context
      }) => {
        context.params = _.toPlainObject(options);
        context.request.body = _.toPlainObject(options.input);
        return await strapi.controllers['currency'].create(context);
      },
      updateCurrencyInput: async (obj, options, {
        context
      }) => {
        context.params = _.toPlainObject(options);
        context.request.body = _.toPlainObject(options.input);
        return await strapi.controllers['currency'].update(context);
      }
    }
  },

}