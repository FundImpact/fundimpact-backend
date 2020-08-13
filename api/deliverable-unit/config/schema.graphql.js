const _ = require('lodash');
module.exports = {
    definition: `
  `,
    query: `
    deliverableUnitList: [DeliverableUnit]
  `,
    mutation: `
        createDeliverableUnitInput(input: DeliverableUnitInput): DeliverableUnit!,
        updateDeliverableUnitInput(id: ID!, input: DeliverableUnitInput): DeliverableUnit!
    `,
    resolver: {
        Query: {
            deliverableUnitList: {
                //policies: ['application::deliverable-unit.addFilter'],
                resolver: 'application::deliverable-unit.deliverable-unit.find'
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