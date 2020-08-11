const _ = require('lodash');
module.exports = {
    definition: `
  `,
    query: `
    financialYearsDonorList: [FinancialYearsDonor]
  `,
    mutation: `
        createFinancialYearsDonorDetail(input: FinancialYearsDonorInput): FinancialYearsDonor!,
        updateFinancialYearsDonorDetail(id: ID!, input: FinancialYearsDonorInput): FinancialYearsDonor!
    `,
    resolver: {
        Query: {
            financialYearsDonorList: {
                // policies: ['application::donors.addFilter'],
                resolver: 'application::financial-years-donor.financial-years-donor.find'
            }
        },
        Mutation: {
            createFinancialYearsDonorDetail: async (obj, options, {context }) => {
                context.params = _.toPlainObject(options);
                context.request.body = _.toPlainObject(options.input);
                return await strapi.controllers['financial-years-donor'].create(context);
            },
            updateFinancialYearsDonorDetail: async (obj, options, {context }) => {
                context.params = _.toPlainObject(options);
                context.request.body = _.toPlainObject(options.input);
                return await strapi.controllers['financial-years-donor'].update(context);
            }
        }
    },

}