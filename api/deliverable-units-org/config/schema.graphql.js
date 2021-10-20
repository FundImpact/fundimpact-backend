const _ = require('lodash');
module.exports = {
    definition: ` `,
    query: `
    deliverableUnitOrg(sort: String , limit: Int, start: Int, where : JSON): [DeliverableUnitsOrg]
    deliverableUnitOrgCount(where : JSON) : Int!
  `,
    mutation: `
        createDeliverableUnitOrg(input: DeliverableUnitsOrgInput): DeliverableUnitsOrg!,
        updateDeliverableUnitOrg(id: ID!, input: DeliverableUnitsOrgInput): DeliverableUnitsOrg!
    `,
    resolver: {
        Query: {
            deliverableUnitOrg: {
                policies: ['application::deliverable-units-org.addFilter'],
                resolver: 'application::deliverable-units-org.deliverable-units-org.find'
            },
            deliverableUnitOrgCount: {
                policies: ['application::deliverable-units-org.addFilter'],
                resolver: 'application::deliverable-units-org.deliverable-units-org.count'
            }
        },
        Mutation: {
            createDeliverableUnitOrg: {
                resolverOf: 'application::deliverable-units-org.deliverable-units-org.create',
                resolver: async (obj, options, {context }) => {
                    context.params = _.toPlainObject(options);
                    context.request.body = _.toPlainObject(options.input);
                    return await strapi.controllers['deliverable-units-org'].create(context);
                }
            },
            updateDeliverableUnitOrg:{
                resolverOf: 'application::deliverable-units-org.deliverable-units-org.update',
                policies: ['application::deliverable-units-org.isDeliverableUnitAssociatedWithDeliverableTarget'],
                resolver: async (obj, options, {context }) => {
                    context.params = _.toPlainObject(options);
                    context.request.body = _.toPlainObject(options.input);
                    return await strapi.controllers['deliverable-units-org'].update(context);
                }
            }
        }
    },

}