const _ = require('lodash');
module.exports = {
  definition: `
  `,
  query: `
    annualYearList(where: JSON): [AnnualYear]
  `,
  mutation: `
        createAnnualYearDetail(input: AnnualYearInput): AnnualYear!,
        updateAnnualYearDetail(id: ID!, input: AnnualYearInput): AnnualYear!
    `,
  resolver: {
    Query: {
      annualYearList: {
        resolver: 'application::annual-year.annual-year.find' 
      }
    },
    Mutation: {
      createAnnualYearDetail: async (obj, options, {
        context
      }) => {
        context.params = _.toPlainObject(options);
        context.request.body = _.toPlainObject(options.input);
        return await strapi.controllers['annual-year'].create(context);
      },
      updateAnnualYearDetail: async (obj, options, {
        context
      }) => {
        context.params = _.toPlainObject(options);
        context.request.body = _.toPlainObject(options.input);
        return await strapi.controllers['annual-year'].update(context);
      }
    }
  },

}