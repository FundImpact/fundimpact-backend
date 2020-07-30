const _ = require('lodash');

/**
 * Throws an ApolloError if context body contains a bad request
 * @param contextBody - body of the context object given to the resolver
 * @throws ApolloError if the body is a bad request
 */
function checkBadRequest(contextBody) {
  if (_.get(contextBody, 'statusCode', 200) !== 200) {
    const message = _.get(contextBody, 'error', 'Bad Request');
    const exception = new Error(message);
    exception.code = _.get(contextBody, 'statusCode', 400);
    exception.data = contextBody;
    throw exception;
  }
}

module.exports = {
  definition: /* GraphQL */ `
  type Organisations{
      id: ID!
      name: String!
    }
  `,
  query: `
    list: Organisations
  `,
  resolver: {
    Query: {
      list: {
        resolver: 'application::organisation.organisation.find',
      }
    },
  },
};
