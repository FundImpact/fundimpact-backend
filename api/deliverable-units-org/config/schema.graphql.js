const _ = require('lodash');
module.exports = {
    definition: `
    type DeliverableUnitOrgList {
      id: ID!,
      name: String!
      description:String
      code : String
      unit_type : String
      prefix_label : String
      suffix_label : String
      organization:CrmPluginOrganization
    }
    input DeliverableUnitOrgInput {
        organization:ID,
        name: String
        description:String
        code : String
        unit_type : String
        prefix_label : String
        suffix_label : String
    }
  `,
    query: `
    deliverableUnitOrg: [DeliverableUnitOrgList]
  `,
    mutation: `
        createDeliverableUnitOrg(input: DeliverableUnitOrgInput): DeliverableUnitOrgList!,
        updateDeliverableUnitOrg(id: ID!, input: DeliverableUnitOrgInput): DeliverableUnitOrgList!
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