const _ = require('lodash');
module.exports = {
    definition: `
  `,
    query: `
    deliverableCategoryUnitList(where: JSON): [DeliverableCategoryUnit]
  `,
    mutation: `
        createDeliverableCategoryUnitInput(input: DeliverableCategoryUnitInput): DeliverableCategoryUnit!,
        updateDeliverableCategoryUnitInput(id: ID!, input: DeliverableCategoryUnitInput): DeliverableCategoryUnit!
    `,
    resolver: {
        Query: {
            deliverableCategoryUnitList: {
                policies: ['application::deliverable-category-unit.addFilter'],
                resolver: 'application::deliverable-category-unit.deliverable-category-unit.find'
            }
        },
        Mutation: {
            createDeliverableCategoryUnitInput: async (obj, options, { context }) => {
                context.params = _.toPlainObject(options);
                context.request.body = _.toPlainObject(options.input);
                return await strapi.controllers['deliverable-category-unit'].create(context);
            },
            updateDeliverableCategoryUnitInput: async (obj, options, { context }) => {
                context.params = _.toPlainObject(options);
                context.request.body = _.toPlainObject(options.input);
                return await strapi.controllers['deliverable-category-unit'].update(context);
            }
        }
    },

}