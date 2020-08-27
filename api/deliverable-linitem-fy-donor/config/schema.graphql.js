const _ = require('lodash');
module.exports = {
    definition: `
  `,
    query: `
    deliverableLinitemFyDonorList(where: JSON): [DeliverableLinitemFyDonor]
  `,
    mutation: `
        createDeliverableLinitemFyDonorInput(input: DeliverableLinitemFyDonorInput): DeliverableLinitemFyDonor!,
        updateDeliverableLinitemFyDonorInput(id: ID!, input: DeliverableLinitemFyDonorInput): DeliverableLinitemFyDonor!
    `,
    resolver: {
        Query: {
            deliverableLinitemFyDonorList: {
                //policies: ['application::deliverable-linitem-fy-donor.addFilter'],
                resolver: 'application::deliverable-linitem-fy-donor.deliverable-linitem-fy-donor.find'
            }
        },
        Mutation: {
            createDeliverableLinitemFyDonorInput: async (obj, options, { context }) => {
                context.params = _.toPlainObject(options);
                context.request.body = _.toPlainObject(options.input);
                return await strapi.controllers['deliverable-linitem-fy-donor'].create(context);
            },
            updateDeliverableLinitemFyDonorInput: async (obj, options, { context }) => {
                context.params = _.toPlainObject(options);
                context.request.body = _.toPlainObject(options.input);
                return await strapi.controllers['deliverable-linitem-fy-donor'].update(context);
            }
        }
    },

}