const _ = require('lodash');
module.exports = {
    definition: `
  `,
    query: `
    projDonors(where: JSON): [ProjectDonor]
  `,
    mutation:`
        createProjDonor(input: ProjectDonorInput): ProjectDonor!,
        updateProjDonor(id: ID!, input: ProjectDonorInput): ProjectDonor!
    `,
    resolver: {
        Query: {
          projDonors: {
               policies: ['application::project-donor.addFilter'],
                resolver: 'application::project-donor.project-donor.find'
            }
        },
        Mutation: {
          createProjDonor: async (obj, options, {
                context
            }) => {
                context.params = _.toPlainObject(options);
                context.request.body = _.toPlainObject(options.input);
                return await strapi.controllers['project-donor'].create(context);
            },
            updateProjDonor: async (obj, options, {
              context
            }) => {
              context.params = _.toPlainObject(options);
              context.request.body = _.toPlainObject(options.input);
              return await strapi.controllers['project-donor'].update(context);
            }
        }
    },
    
}