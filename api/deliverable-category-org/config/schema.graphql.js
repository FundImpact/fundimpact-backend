const _ = require('lodash');
module.exports = {
    definition: `
    type DeliverableCategoryList {
      id: ID!,
      name: String!
      description:String
      code : String
      organization:CrmPluginOrganization
    }
    input DeliverableCategoryInput {
        organization:ID,
        name: String,
        code: String,
        description:String
    }
  `,
    query: `
    deliverableCategory: [DeliverableCategoryList]
  `,
    mutation: `
        createDeliverableCategory(input: DeliverableCategoryInput): DeliverableCategoryList!,
        updateDeliverableCategory(id: ID!, input: DeliverableCategoryInput): DeliverableCategoryList!
    `,
    resolver: {
        Query: {
            deliverableCategory: {
                // policies: ['application::donors.addFilter'],
                resolver: 'application::deliverable-category-org.deliverable-category-org.find'
            }
        },
        Mutation: {
            createDeliverableCategory: async (obj, options, {context }) => {
                console.log("options" , options);
                context.params = _.toPlainObject(options);
                context.request.body = _.toPlainObject(options.input);
                console.log("context" , context , strapi.controllers)
                return await strapi.controllers['deliverable-category-org'].create(context);
            },
            updateDeliverableCategory: async (obj, options, {context }) => {
                context.params = _.toPlainObject(options);
                context.request.body = _.toPlainObject(options.input);
                return await strapi.controllers['deliverable-category-org'].update(context);
            }
        }
    },

}