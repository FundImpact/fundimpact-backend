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
  type: {
    UsersPermissionsPermission: false, // Make this type NOT queriable.
  },
  definition: /* GraphQL */ `
    type UserCustomer {
      id: ID!
      username: String!
      email: String!
      confirmed: Boolean
      blocked: Boolean
      role:  UserCustomerRole
    }

    type UserCustomerRole {
      id: ID!
      name: String!
      description: String
      type: String
    }


    input UserCustomerInput {
      email: String
      password: String
    }

    type UserCustomerLogin {
      jwt: String
      user: UserCustomer!
    }

  `,
  query: `
   userCustomer: UserCustomer
  `,
  mutation: `
  userCustomerLogin(email: String, password: String): UserCustomerLogin
  `,
  resolver: {
    Query: {
      userCustomer: {
        resolver: 'plugins::users-permissions.user.me',
      },
    },
    Mutation: {
      userCustomerLogin: {
        resolverOf: 'plugins::users-permissions.auth.callback',
        resolver: async (obj, options, { context }) => {
          context.params = {
            ...context.params,
          };
          context.request.body = _.toPlainObject(options);
          await strapi.plugins['users-permissions'].controllers.auth.callback(context);
          let output = context.body.toJSON ? context.body.toJSON() : context.body;

          checkBadRequest(output);
          return {
            user: output.user || output,
            jwt: output.jwt,
          };
        },
      },
    },
  },
};
