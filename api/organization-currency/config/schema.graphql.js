const _ = require('lodash');
module.exports = {
  definition: `
  `,
  query: `
    orgCurrencies(where: JSON): [OrganizationCurrency]
  `,
  mutation: `
        createOrgCurrency(input: OrganizationCurrencyInput): OrganizationCurrency!,
        updateOrgCurrency(id: ID!, input: OrganizationCurrencyInput): OrganizationCurrency!
    `,
  resolver: {
    Query: {
      orgCurrencies: {
        policies: ['application::organization-currency.addFilter'],
        resolver: 'application::organization-currency.organization-currency.find'
      }
    },
    Mutation: {
      createOrgCurrency: {
        resolverOf: "application::organization-currency.organization-currency.create",
        resolver: async (obj, options, { context }) => {
          context.params = _.toPlainObject(options);
          context.request.body = _.toPlainObject(options.input);
          return await strapi.controllers['organization-currency'].create(context);
        }
      },
      updateOrgCurrency: {
        resolverOf: "application::organization-currency.organization-currency.update",
        resolver: async (obj, options, { context }) => {
          context.params = _.toPlainObject(options);
          context.request.body = _.toPlainObject(options.input);
          return await strapi.controllers['organization-currency'].update(context);
        }
      }
    }
  },

}