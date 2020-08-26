const _ = require('lodash');
module.exports = {
    definition: ` `,
    query:
        `deliverableCategory(sort: String , limit: Int, start: Int,  where : JSON): [DeliverableCategoryOrg]
        deliverableCategoryCount(where : JSON) : Int!`,

    mutation:
        `   createDeliverableCategory(input: DeliverableCategoryOrgInput): DeliverableCategoryOrg!,
        updateDeliverableCategory(id: ID!, input: DeliverableCategoryOrgInput): DeliverableCategoryOrg! `,
    resolver: {
        Query: {
            deliverableCategory: {
                policies: ['application::deliverable-category-org.addFilter'],
                resolver: 'application::deliverable-category-org.deliverable-category-org.find'
            },
            deliverableCategoryCount: {
                policies: ['application::deliverable-category-org.addFilter'],
                resolver: 'application::deliverable-category-org.deliverable-category-org.count'
            },
        },
        Mutation: {
            createDeliverableCategory: async (obj, options, { context }) => {
                context.params = _.toPlainObject(options);
                context.request.body = _.toPlainObject(options.input);
                return await strapi.controllers['deliverable-category-org'].create(context);
            },
            updateDeliverableCategory: async (obj, options, { context }) => {
                context.params = _.toPlainObject(options);
                context.request.body = _.toPlainObject(options.input);
                return await strapi.controllers['deliverable-category-org'].update(context);
            }
        }
    },

}