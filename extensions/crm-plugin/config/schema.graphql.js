const _ = require('lodash');

/**
 * Throws an ApolloError if context body contains a bad request
 * @param contextBody - body of the context object given to the resolver
 * @throws ApolloError if the body is a bad request
 */
module.exports = {
    type: {
        UsersPermissionsPermission: true, // Make this type NOT queriable.
    },
    definition: /* GraphQL */ `
            type OrganizationList {
                id: ID!
                name: String
                contact: String
                address: String
                account : Account
                organisation_registration_type : OrganisationRegistrationType
                short_name : String
                legal_name : String
                description : String
                contact_type: String
            }
            input OrganisationInput {
                name: String
                address: String
                account : ID
                organisation_registration_type : ID
                short_name : String
                legal_name : String
                description : String
                contact_type: String
            }
    `,
    query: `
    organisationList: [OrganizationList]
    `,
    mutation: `
        organisationUpdate(id: ID!, input: OrganisationInput): OrganizationList
    `,
    resolver: {
        Query: {
            organisationList: {
                resolverOf: 'plugins::crm-plugin.organization.find',
                resolver: async (obj, options, {
                    context
                  }) =>{
                    Object.assign(context.query,{account:context.state.user.account})
                    return await strapi.plugins['crm-plugin'].controllers.organization.find(context);
                }
            },
        },
        Mutation: {
            organisationUpdate: async (obj, options, {
                context
              }) => {
                context.params = _.toPlainObject(options);
                context.request.body = _.toPlainObject(options.input);
                return await strapi.plugins['crm-plugin'].controllers.organization.update(context);
              }
        }
    },
};
