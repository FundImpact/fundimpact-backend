const _ = require('lodash');
module.exports = {
    definition: `
  `,
    query: `
    impactLinitemFyDonorList(where: JSON): [ImpactLinitemFyDonor]
  `,
    mutation: `
        createImpactLinitemFyDonorInput(input: ImpactLinitemFyDonorInput): ImpactLinitemFyDonor!,
        updateImpactLinitemFyDonorInput(id: ID!, input: ImpactLinitemFyDonorInput): ImpactLinitemFyDonor!
    `,
    resolver: {
        Query: {
            impactLinitemFyDonorList: {
                //policies: ['application::impact-linitem-fy-donor.addFilter'],
                resolver: 'application::impact-linitem-fy-donor.impact-linitem-fy-donor.find'
            }
        },
        Mutation: {
            createImpactLinitemFyDonorInput: {
                resolverOf: "application::impact-linitem-fy-donor.impact-linitem-fy-donor.create",
                resolver: async (obj, options, { context }) => {
                    context.params = _.toPlainObject(options);
                    context.request.body = _.toPlainObject(options.input);
                    return await strapi.controllers['impact-linitem-fy-donor'].create(context);
                }
            },
            updateImpactLinitemFyDonorInput:{
                resolverOf: "application::impact-linitem-fy-donor.impact-linitem-fy-donor.update",
                resolver: async (obj, options, { context }) => {
                    context.params = _.toPlainObject(options);
                    context.request.body = _.toPlainObject(options.input);
                    return await strapi.controllers['impact-linitem-fy-donor'].update(context);
                }
            } 
        }
    },

}