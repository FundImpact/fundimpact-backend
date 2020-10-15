const _ = require('lodash');
module.exports = {
    definition: `
  `,
    query: `
    financialYearsOrgList(where: JSON): [FinancialYearsOrg]
  `,
    mutation: `
        createFinancialYearsOrgDetail(input: FinancialYearsOrgInput): FinancialYearsOrg!,
        updateFinancialYearsOrgDetail(id: ID!, input: FinancialYearsOrgInput): FinancialYearsOrg!
    `,
    resolver: {
        Query: {
            financialYearsOrgList: {
                policies: ['application::financial-years-org.addFilter'],
                resolver: 'application::financial-years-org.financial-years-org.find'
            }
        },
        Mutation: {
            createFinancialYearsOrgDetail: async (obj, options, {context }) => {
                context.params = _.toPlainObject(options);
                context.request.body = _.toPlainObject(options.input);
                return await strapi.controllers['financial-years-org'].create(context);
            },
            updateFinancialYearsOrgDetail: async (obj, options, {context }) => {
                context.params = _.toPlainObject(options);
                context.request.body = _.toPlainObject(options.input);
                return await strapi.controllers['financial-years-org'].update(context);
            }
        }
    },

}