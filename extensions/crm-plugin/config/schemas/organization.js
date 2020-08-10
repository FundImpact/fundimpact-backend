const _ = require('lodash');

/**
 * Throws an ApolloError if context body contains a bad request
 * @param contextBody - body of the context object given to the resolver
 * @throws ApolloError if the body is a bad request
 */
module.exports = {
    definition: /* GraphQL */ `
            type OrganizationList {
                id: ID!
                name: String
                contact: String
                address: String
                account : Account
                organization_registration_type : OrganizationRegistrationType
                short_name : String
                legal_name : String
                description : String
                contact_type: String
            }
            input OrgInput {
                name: String
                address: String
                account : ID
                organization_registration_type : ID
                short_name : String
                legal_name : String
                description : String
                contact_type: String
            }
    `,
    query: `
    organizationList: [OrganizationList]
    `,
    mutation: `
        organizationUpdate(id: ID!, input: OrgInput): OrganizationList
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
