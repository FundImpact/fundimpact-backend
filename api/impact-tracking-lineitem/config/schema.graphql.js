const _ = require('lodash');
module.exports = {
  definition: `
  `,
  query: `
  impactTrackingLineitemList(sort: String , limit: Int, start: Int,where: JSON): [ImpactTrackingLineitem]
  impactTrackingSpendValue(where : JSON) : Float!
  impactTrackingLineitemListCount(where : JSON) : Int!
  impactTrackingLineitemTotalSpendAmount(where : JSON) : Float!
  `,
  mutation: `
        createImpactTrackingLineitemInput(input: ImpactTrackingLineitemInput): ImpactTrackingLineitem!,
        updateImpactTrackingLineitemInput(id: ID!, input: ImpactTrackingLineitemInput): ImpactTrackingLineitem!
    `,
  resolver: {
    Query: {
      impactTrackingLineitemList: {
        policies: ['application::impact-tracking-lineitem.addFilter'],
        resolver: 'application::impact-tracking-lineitem.impact-tracking-lineitem.find'
      },
      impactTrackingLineitemListCount: {
        policies: ['application::impact-tracking-lineitem.addFilter'],
        resolver: 'application::impact-tracking-lineitem.impact-tracking-lineitem.count'
      },
      impactTrackingLineitemTotalSpendAmount: async (obj, options, { context }) => {
        context.params = _.toPlainObject(options);
        context.request.body = _.toPlainObject(options.input);
        return await strapi.services['impact-tracking-lineitem'].totalSpendAmountByProject(context);
      },
      impactTrackingSpendValue: async (obj, options, { context }) => {
        context.params = _.toPlainObject(options);
        context.request.body = _.toPlainObject(options.input);
        return await strapi.services['impact-tracking-lineitem'].totalAchivedValue(context);
      }
    },
    Mutation: {
      createImpactTrackingLineitemInput: {
        resolverOf: "application::impact-tracking-lineitem.impact-tracking-lineitem.create",
        resolver: async (obj, options, { context }) => {
          context.params = _.toPlainObject(options);
          context.request.body = _.toPlainObject(options.input);
          return await strapi.controllers['impact-tracking-lineitem'].create(context);
        }
      },
      updateImpactTrackingLineitemInput: {
        resolverOf: "application::impact-tracking-lineitem.impact-tracking-lineitem.update",
        resolver: async (obj, options, { context }) => {
          context.params = _.toPlainObject(options);
          context.request.body = _.toPlainObject(options.input);
          return await strapi.controllers['impact-tracking-lineitem'].update(context);
        }
      }
    }
  },

}