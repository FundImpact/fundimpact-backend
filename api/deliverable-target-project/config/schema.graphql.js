const _ = require('lodash');
module.exports = {
    definition: ` `,
    query: 
    ` deliverableTargetList(where : JSON): [DeliverableTargetProject] `,
    mutation: 
    `   createDeliverableTarget(input: DeliverableTargetProjectInput): DeliverableTargetProject!,
        updateDeliverableTarget(id: ID!, input: DeliverableTargetProjectInput): DeliverableTargetProject! `,
    resolver: {
        Query: {
            deliverableTargetList: {
                policies: ['application::deliverable-target-project.addFilter'],
                resolver: 'application::deliverable-target-project.deliverable-target-project.find'
            }
        },
        Mutation: {
            createDeliverableTarget: async (obj, options, {context }) => {
                context.params = _.toPlainObject(options);
                context.request.body = _.toPlainObject(options.input);
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