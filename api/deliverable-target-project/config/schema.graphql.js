const _ = require('lodash');
module.exports = {
    definition: ` `,
    query:`
        deliverableTargetList(sort: String , limit: Int, start: Int, where : JSON): [DeliverableTargetProject] 
        deliverableTargetTotalAmount(where : JSON) : Float!
        deliverableTargetCount(where : JSON) : Int!
        deliverableAchieved(where : JSON) : JSON!
    `,
    mutation:
        `   createDeliverableTarget(input: DeliverableTargetProjectInput): DeliverableTargetProject!,
        updateDeliverableTarget(id: ID!, input: DeliverableTargetProjectInput): DeliverableTargetProject! `,
    resolver: {
        Query: {
            deliverableTargetList: {
                policies: ['application::deliverable-target-project.addFilter'],
                resolver: 'application::deliverable-target-project.deliverable-target-project.find'
            },
            deliverableTargetCount: {
                policies: ['application::deliverable-target-project.addFilter'],
                resolver: 'application::deliverable-target-project.deliverable-target-project.count'
            },
            deliverableTargetTotalAmount: async (obj, options, { context }) => {
                context.params = _.toPlainObject(options);
                context.request.body = _.toPlainObject(options.input);
                return await strapi.services['deliverable-target-project'].totalDeliverableAmount(context);
            },
            resolver: async (obj, options, { context }) => {
                context.params = _.toPlainObject(options);
                context.request.body = _.toPlainObject(options.input);
                return await strapi.services['deliverable-target-project'].totalDeliverableAchieved(context);
            }
            // deliverableAchieved: {
            //     policies: ['application::deliverable-target-project.addFilter'],
            //     resolverOf: 'application::deliverable-target-project.deliverable-target-project.totalDeliverableAchieved',
            //     resolver: async (obj, options, { context }) => {
            //       context.params = _.toPlainObject(options);
            //       context.request.body = _.toPlainObject(options.input);
            //       //return await strapi.controllers['deliverable-target-project'].deliverable_achieved(context);
            //       return await strapi.services['deliverable-target-project'].totalDeliverableAchieved(context);
            //     }
            // },
        },
        Mutation: {
            createDeliverableTarget: {
                resolverOf: 'application::deliverable-target-project.deliverable-target-project.create',
                resolver: async (obj, options, { context }) => {
                    context.params = _.toPlainObject(options);
                    context.request.body = _.toPlainObject(options.input);
                    return await strapi.controllers['deliverable-target-project'].create(context);
                },
            }, 
            updateDeliverableTarget: {
                resolverOf: 'application::deliverable-target-project.deliverable-target-project.update',
                resolver: async (obj, options, { context }) => {
                    context.params = _.toPlainObject(options);
                    context.request.body = _.toPlainObject(options.input);
                    return await strapi.controllers['deliverable-target-project'].update(context);
                }
            } 
        }
    },

}