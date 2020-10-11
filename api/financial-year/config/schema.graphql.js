const _ = require('lodash');
module.exports = {
    definition: `
  `,
    query: `
    financialYearList(where : JSON): [FinancialYear]
  `,
    mutation: `
        createFinancialYearDetail(input: FinancialYearInput): FinancialYear!,
        updateFinancialYearDetail(id: ID!, input: FinancialYearInput): FinancialYear!
    `,
    resolver: {
        Query: {
            financialYearList: {
                // policies: ['application::financial-year.addFilter'],
                resolver: 'application::financial-year.financial-year.find'
            }
        },
        Mutation: {
            createFinancialYearDetail: {
                resolverOf: "application::financial-year.financial-year.create",
                resolver:async (obj, options, {context }) => {
                    context.params = _.toPlainObject(options);
                    context.request.body = _.toPlainObject(options.input);
                    return await strapi.controllers['financial-year'].create(context);
                }
            },
            updateFinancialYearDetail: {
                resolverOf: "application::financial-year.financial-year.update",
                resolver: async (obj, options, {context }) => {
                    context.params = _.toPlainObject(options);
                    context.request.body = _.toPlainObject(options.input);
                    return await strapi.controllers['financial-year'].update(context);
                }
            }
        }
    },

}