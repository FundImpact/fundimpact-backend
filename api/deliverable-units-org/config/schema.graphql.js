const _ = require('lodash');
module.exports = {
    definition: ` `,
    query: `
    deliverableUnitOrg: [DeliverableUnitsOrg]
  `,
    mutation: `
        createDeliverableUnitOrg(input: DeliverableUnitInput): DeliverableUnitsOrg!,
        updateDeliverableUnitOrg(id: ID!, input: DeliverableUnitInput): DeliverableUnitsOrg!
    `,
    resolver: {
        Query: {
            deliverableUnitOrg: {
                policies: ['application::deliverable-units-org.addFilter'],
                resolver: 'application::deliverable-units-org.deliverable-units-org.find'
            }
        },
        Mutation: {
            createDeliverableUnitOrg: async (obj, options, {context }) => {
                context.params = _.toPlainObject(options);
                context.request.body = _.toPlainObject(options.input);
                return await strapi.controllers['deliverable-units-org'].create(context);
            },
            updateDeliverableUnitOrg: async (obj, options, {context }) => {
                context.params = _.toPlainObject(options);
                context.request.body = _.toPlainObject(options.input);
                return await strapi.controllers['deliverable-units-org'].update(context);
            }
        }
    },

}