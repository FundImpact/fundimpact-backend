const _ = require('lodash');
module.exports = {
    definition: `
  `,
    query: `
    deliverableUnitList(sort: String , limit: Int, start: Int,where : JSON): [DeliverableUnit]
    deliverableUnitCount(where : JSON) : Int!
  `,
    mutation: `
        createDeliverableUnitInput(input: DeliverableUnitInput): DeliverableUnit!,
        updateDeliverableUnitInput(id: ID!, input: DeliverableUnitInput): DeliverableUnit!
    `,
    resolver: {
        Query: {
            deliverableUnitList: {
                resolver: 'application::deliverable-unit.deliverable-unit.find'
            },
            deliverableUnitCount: {
                resolver: 'application::deliverable-unit.deliverable-unit.count'
            }
        },
        Mutation: {
            createDeliverableUnitInput: async (obj, options, { context }) => {
                context.params = _.toPlainObject(options);
                context.request.body = _.toPlainObject(options.input);
                return await strapi.controllers['deliverable-unit'].create(context);
            },
            updateDeliverableUnitInput: async (obj, options, { context }) => {
                context.params = _.toPlainObject(options);
                context.request.body = _.toPlainObject(options.input);
                return await strapi.controllers['deliverable-unit'].update(context);
            }
        }
    },

}