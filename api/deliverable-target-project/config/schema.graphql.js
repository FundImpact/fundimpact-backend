const _ = require('lodash');
module.exports = {
    definition: `
    type DeliverableTargetList {
      id: ID!,
      name: String!
      description:String
      target_value : Float
    }
    input DeliverableTargetInput {
        deliverable_category_org:ID
        deliverable_units_org : ID
        project : ID
        name: String
        description:String
        target_value : Float
    }
  `,
    query: `
     deliverableTargetList: [DeliverableTargetList]
  `,
    mutation: `
        createDeliverableTarget(input: DeliverableTargetInput): DeliverableTargetList!,
        updateDeliverableTarget(id: ID!, input: DeliverableTargetInput): DeliverableTargetList!
    `,
    resolver: {
        Query: {
            deliverableTargetList: {
                // policies: ['application::donors.addFilter'],
                resolver: 'application::deliverable-target-project.deliverable-target-project.find'
            }
        },
        Mutation: {
            createDeliverableTarget: async (obj, options, {context }) => {
                console.log("options" , options);
                context.params = _.toPlainObject(options);
                context.request.body = _.toPlainObject(options.input);
                console.log("context" , context , strapi.controllers)
                return await strapi.controllers['deliverable-target-project'].create(context);
            },
            updateDeliverableTarget: async (obj, options, {context }) => {
                context.params = _.toPlainObject(options);
                context.request.body = _.toPlainObject(options.input);
                return await strapi.controllers['deliverable-target-project'].update(context);
            }
        }
    },

}