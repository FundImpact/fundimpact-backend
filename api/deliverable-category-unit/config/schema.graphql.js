const _ = require('lodash');
module.exports = {
    definition: `
  `,
    query: `
    deliverableCategoryUnitList(sort: String , limit: Int, start: Int, where: JSON): [DeliverableCategoryUnit]
    deliverableCategoryUnitCount(where : JSON) : Int!
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
            },
            deliverableCategoryUnitCount: {
                policies: ['application::deliverable-category-unit.addFilter'],
                resolver: 'application::deliverable-category-unit.deliverable-category-unit.count'
            }
        },
        Mutation: {
            createDeliverableCategoryUnitInput: {
                resolverOf:'application::deliverable-category-unit.deliverable-category-unit.create',
                resolver:async (obj, options, { context }) => {
                    context.params = _.toPlainObject(options);
                    context.request.body = _.toPlainObject(options.input);
                    return await strapi.controllers['deliverable-category-unit'].create(context);
                },
            },
            updateDeliverableCategoryUnitInput:{
                resolverOf:'application::deliverable-category-unit.deliverable-category-unit.update',
                resolver : async (obj, options, { context }) => {
                    context.params = _.toPlainObject(options);
                    context.request.body = _.toPlainObject(options.input);
                    return await strapi.controllers['deliverable-category-unit'].update(context);
                }
            } 
        }
    },

}