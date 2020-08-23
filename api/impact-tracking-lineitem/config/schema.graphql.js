const _ = require('lodash');
module.exports = {
  definition: `
  `,
  query: `
  impactTrackingLineitemList(where: JSON): [ImpactTrackingLineitem]
  impactTrackingSpendValue(where : JSON) : Float!
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
      impactTrackingSpendValue: async (obj, options, { context }) => {
        context.params = _.toPlainObject(options);
        context.request.body = _.toPlainObject(options.input);
        return await strapi.services['impact-tracking-lineitem'].totalAchivedValue(context);
      }
    },
    Mutation: {
      createImpactTrackingLineitemInput: async (obj, options, { context }) => {
        context.params = _.toPlainObject(options);
        context.request.body = _.toPlainObject(options.input);
        return await strapi.controllers['impact-tracking-lineitem'].create(context);
      },
      updateImpactTrackingLineitemInput: async (obj, options, { context }) => {
        context.params = _.toPlainObject(options);
        context.request.body = _.toPlainObject(options.input);
        return await strapi.controllers['impact-tracking-lineitem'].update(context);
      }
    }
  },

}