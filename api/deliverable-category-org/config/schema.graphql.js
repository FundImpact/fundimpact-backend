const _ = require('lodash');
module.exports = {
    definition: ` `,
    query:
        `deliverableCategory(sort: String , limit: Int, start: Int,  where : JSON): [DeliverableCategoryOrg]
        deliverableCategoryCount(where : JSON) : Int!
        projectCountDelCatByOrg(where : JSON) : JSON!
        projectCountDelUnit(where : JSON) : JSON!  
        totalDeliverableByOrg(where : JSON) : JSON!
        totalAchivedProjectByOrg(where : JSON) : JSON!
        avgAchivementDeliverableByOrg(where : JSON) : JSON!
        achiveDeliverableVsTargetByOrg(where : JSON) : JSON!`,

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
            projectCountDelCatByOrg: {
                policies: ['application::deliverable-category-org.addFilter'],
                resolverOf: 'application::deliverable-category-org.deliverable-category-org.projectCountDelCatByOrg',
                resolver: async (obj, options, { context }) => {
                    context.params = _.toPlainObject(options);
                    context.request.body = _.toPlainObject(options.input);
                    return await strapi.controllers['deliverable-category-org'].projectCountDelCatByOrg(context);
                }
            },
            projectCountDelUnit: {
                policies: ['application::deliverable-category-org.addFilter'],
                resolverOf: 'application::deliverable-category-org.deliverable-category-org.projectCountDelUnit',
                resolver: async (obj, options, { context }) => {
                    context.params = _.toPlainObject(options);
                    context.request.body = _.toPlainObject(options.input);
                    return await strapi.controllers['deliverable-category-org'].projectCountDelUnit(context);
                }
            },
            totalDeliverableByOrg: {
                policies: ['application::deliverable-category-org.addFilter'],
                resolverOf: 'application::deliverable-category-org.deliverable-category-org.totalDeliverableByOrg',
                resolver: async (obj, options, { context }) => {
                    context.params = _.toPlainObject(options);
                    context.request.body = _.toPlainObject(options.input);
                    return await strapi.controllers['deliverable-category-org'].totalDeliverableByOrg(context);
                }
            },
            totalAchivedProjectByOrg: {
                policies: ['application::deliverable-category-org.addFilter'],
                resolverOf: 'application::deliverable-category-org.deliverable-category-org.totalAchivedProjectByOrg',
                resolver: async (obj, options, { context }) => {
                    context.params = _.toPlainObject(options);
                    context.request.body = _.toPlainObject(options.input);
                    return await strapi.controllers['deliverable-category-org'].totalAchivedProjectByOrg(context);
                }
            },
            avgAchivementDeliverableByOrg: {
                policies: ['application::deliverable-category-org.addFilter'],
                resolverOf: 'application::deliverable-category-org.deliverable-category-org.avgAchivementDeliverableByOrg',
                resolver: async (obj, options, { context }) => {
                    context.params = _.toPlainObject(options);
                    context.request.body = _.toPlainObject(options.input);
                    return await strapi.controllers['deliverable-category-org'].avgAchivementDeliverableByOrg(context);
                }
            },
            achiveDeliverableVsTargetByOrg: {
                policies: ['application::deliverable-category-org.addFilter'],
                resolverOf: 'application::deliverable-category-org.deliverable-category-org.achiveDeliverableVsTargetByOrg',
                resolver: async (obj, options, { context }) => {
                    context.params = _.toPlainObject(options);
                    context.request.body = _.toPlainObject(options.input);
                    return await strapi.controllers['deliverable-category-org'].achiveDeliverableVsTargetByOrg(context);
                }
            }
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