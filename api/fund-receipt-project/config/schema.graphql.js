const _ = require('lodash');
module.exports = {
  definition: `
  `,
  query: `
    fundReceiptProjectList(sort: String , limit: Int, start: Int, where: JSON): [FundReceiptProject]
    fundReceiptProjectTotalAmount(where : JSON) : Float!
    fundRecipetValuesByOrg(where : JSON) : Float!
    fundReceiptProjectListCount(where : JSON) : Int!
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
      fundReceiptProjectListCount: {
        policies: ['application::fund-receipt-project.addFilter'],
        resolver: 'application::fund-receipt-project.fund-receipt-project.count'
      },
      fundReceiptProjectTotalAmount: async (obj, options, {
        context
      }) => {
        context.params = _.toPlainObject(options);
        context.request.body = _.toPlainObject(options.input);
        return await strapi.services['fund-receipt-project'].totalRecivedAmt(context);
      },
      fundRecipetValuesByOrg: {
        policies: ['application::fund-receipt-project.addFilter'],
        resolverOf: 'application::fund-receipt-project.fund-receipt-project.fund_recipet_values',
        resolver: async (obj, options, { context }) => {
          context.params = _.toPlainObject(options);
          context.request.body = _.toPlainObject(options.input);
          return await strapi.controllers['fund-receipt-project'].fund_recipet_values(context);
        }
      },
    },
    Mutation: {
      createFundReceiptProjectInput: {
        resolverOf: "application::fund-receipt-project.fund-receipt-project.create",
        resolver:async (obj, options, { context }) => {
          context.params = _.toPlainObject(options);
          context.request.body = _.toPlainObject(options.input);
          return await strapi.controllers['fund-receipt-project'].create(context);
        }
      },
      updateFundReceiptProjectInput:{
        resolverOf: "application::fund-receipt-project.fund-receipt-project.update",
        resolver: async (obj, options, { context }) => {
          context.params = _.toPlainObject(options);
          context.request.body = _.toPlainObject(options.input);
          return await strapi.controllers['fund-receipt-project'].update(context);
        }
      }
    }
  },
}