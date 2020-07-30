const _ = require('lodash');
/**
 * Throws an ApolloError if context body contains a bad request
 * @param contextBody - body of the context object given to the resolver
 * @throws ApolloError if the body is a bad request
 */
module.exports = {
  definition: /* GraphQL */ ``,
  query: `
    organisationList: [Organisation]
  `,
  mutation: `
    organisationUpdate(id: ID!, input: OrganisationInput): Organisation!
  `,
  resolver: {
    Query: {
      organisationList: {
        policies: ['application::organisation.addFilter'],
        resolver: 'application::organisation.organisation.find',
      }
    },
    Mutation: {
      organisationUpdate: async (obj, options, {
        context
      }) => {
        context.params = _.toPlainObject(options);
        context.request.body = _.toPlainObject(options.input);
        return await strapi.controllers.organisation.update(context);
        
      }
    }
  },
};
