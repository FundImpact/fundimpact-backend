const _ = require('lodash');
module.exports = {
    definition: ``,
    query: `
    deliverableTrackingLineitemList(sort: String , limit: Int, start: Int, where : JSON): [DeliverableTrackingLineitem]
    deliverableTrackingTotalValue(where : JSON) : Float!
  `,
    mutation: `
        createDeliverableTrackingLineitemDetail(input: DeliverableTrackingLineitemInput): DeliverableTrackingLineitem!,
        updateDeliverableTrackingLineitemDetail(id: ID!, input: DeliverableTrackingLineitemInput): DeliverableTrackingLineitem!
    `,
    resolver: {
        Query: {
            deliverableTrackingLineitemList: {
                policies: ['application::deliverable-tracking-lineitem.addFilter'],
                resolver: 'application::deliverable-tracking-lineitem.deliverable-tracking-lineitem.find'
            },
            deliverableTrackingTotalValue : async (obj, options, {context }) => {
                context.params = _.toPlainObject(options);
                context.request.body = _.toPlainObject(options.input);
                return await strapi.services['deliverable-tracking-lineitem'].totalAchivedValue(context);
            },
        },
        Mutation: {
            createDeliverableTrackingLineitemDetail: async (obj, options, {context }) => {
                context.params = _.toPlainObject(options);
                context.request.body = _.toPlainObject(options.input);
                return await strapi.controllers['deliverable-tracking-lineitem'].create(context);
            },
            updateDeliverableTrackingLineitemDetail: async (obj, options, {context }) => {
                context.params = _.toPlainObject(options);
                context.request.body = _.toPlainObject(options.input);
                return await strapi.controllers['deliverable-tracking-lineitem'].update(context);
            }
        }
    },

}