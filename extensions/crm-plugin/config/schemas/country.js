const _ = require('lodash');

/**
 * Throws an ApolloError if context body contains a bad request
 * @param contextBody - body of the context object given to the resolver
 * @throws ApolloError if the body is a bad request
 */
module.exports = {
    definition: /* GraphQL */ `
        type Country {
            id: ID!
            name: String
            abbreviation: String
            identifier: String
        }
    `,
    query: `
    countryList: [Country]
    `,
    resolver: {
        Query: {
            countryList: {
                resolverOf: 'plugins::crm-plugin.country.find',
                resolver: async (obj, options, {
                    context
                  }) =>{
                    Object.assign(context.query,{account:context.state.user.account})
                    return await strapi.plugins['crm-plugin'].controllers.country.find(context);
                }
            },
        }
    },
};
