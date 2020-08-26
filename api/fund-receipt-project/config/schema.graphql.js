const _ = require('lodash');
module.exports = {
  definition: `
  `,
  query: `
    fundReceiptProjectList(where: JSON): [FundReceiptProject]
    fundReceiptProjectTotalAmount(where : JSON) : Float!
  `,
  mutation: `
        createFundReceiptProjectInput(input: FundReceiptProjectInput): FundReceiptProject!,
        updateFundReceiptProjectInput(id: ID!, input: FundReceiptProjectInput): FundReceiptProject!
    `,
  resolver: {
    Query: {
      fundReceiptProjectList: {
        policies: ['application::fund-receipt-project.addFilter'],
        resolver: 'application::fund-receipt-project.fund-receipt-project.find'
      },
      fundReceiptProjectTotalAmount: async (obj, options, {
        context
      }) => {
        context.params = _.toPlainObject(options);
        context.request.body = _.toPlainObject(options.input);
        return await strapi.services['fund-receipt-project'].totalRecivedAmt(context);
      }
    },
    Mutation: {
      createFundReceiptProjectInput: async (obj, options, { context }) => {
        context.params = _.toPlainObject(options);
        context.request.body = _.toPlainObject(options.input);
        return await strapi.controllers['fund-receipt-project'].create(context);
      },
      updateFundReceiptProjectInput: async (obj, options, { context }) => {
        context.params = _.toPlainObject(options);
        context.request.body = _.toPlainObject(options.input);
        return await strapi.controllers['fund-receipt-project'].update(context);
      }
    }
  },

}