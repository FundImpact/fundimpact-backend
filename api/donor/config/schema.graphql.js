const _ = require('lodash');
module.exports = {
    definition: `
  `,
    query: `
    orgDonors(sort: String , limit: Int, start: Int, where: JSON): [Donor]
    orgDonorsCount( where: JSON): Float!
  `,
    mutation:`
        createOrgDonor(input: DonorInput): Donor!,
        updateOrgDonor(id: ID!, input: DonorInput): Donor!
    `,
    resolver: {
        Query: {
          orgDonors: {
              policies: ['application::donor.addFilter'],
              resolver: 'application::donor.donor.find'
            },
            orgDonorsCount: {
              policies: ['application::donor.addFilter'],
              resolver: 'application::donor.donor.count'
            },

        },
        Mutation: {
          createOrgDonor: async (obj, options, {
                context
            }) => {
                context.params = _.toPlainObject(options);
                context.request.body = _.toPlainObject(options.input);
                return await strapi.controllers.donor.create(context);
            },
            updateOrgDonor: async (obj, options, {
              context
            }) => {
              context.params = _.toPlainObject(options);
              context.request.body = _.toPlainObject(options.input);
              return await strapi.controllers.donor.update(context);
            }
        }
    },
    
}