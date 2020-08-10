const _ = require('lodash');
module.exports = {
    definition: `
    type OrgDonor {
      id: ID!,
      name: String!,
      short_name: String!
      description:String
      organization:CrmPluginOrganization
    }
    input OrgDonorInput {
        organization:ID!,
        name: String!,
        short_name: String!,
        description:String
    }
  `,
    query: `
    OrgDonors(where: JSON): [OrgDonor]
  `,
    mutation:`
        createOrgDonor(input: OrgDonorInput): OrgDonor!,
        updateOrgDonor(id: ID!, input: OrgDonorInput): OrgDonor!
    `,
    resolver: {
        Query: {
            orgWorkspaces: {
               // policies: ['application::donors.addFilter'],
                resolver: 'application::donors.donors.find'
            }
        },
        Mutation: {
          createOrgDonor: async (obj, options, {
                context
            }) => {
                context.params = _.toPlainObject(options);
                context.request.body = _.toPlainObject(options.input);
                return await strapi.controllers.workspace.create(context);
            },
            updateOrgDonor: async (obj, options, {
              context
            }) => {
              context.params = _.toPlainObject(options);
              context.request.body = _.toPlainObject(options.input);
              return await strapi.controllers.workspace.update(context);
            }
        }
    },
    
}