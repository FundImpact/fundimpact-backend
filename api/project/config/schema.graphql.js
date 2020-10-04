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
  `,
  query: `
    orgProject(where: JSON): [Project]
    orgProjectCount(where: JSON): JSON
  `,
  mutation: `
    createOrgProject(input: ProjectInput): Project
    updateOrgProject(id: ID!, input: ProjectInput): Project
  `,
  resolver: {
    Query: {
      orgProject: {
        policies : ['application::project.addFilter'],
        resolver: 'application::project.project.find',
      },
      orgProjectCount:{
        policies : ['application::project.addFilter'],
        resolver: 'application::project.project.count',
      }
    },
    Mutation: {
      createOrgProject:  async (obj, options, { context }) => {
          context.params = _.toPlainObject(options);
          context.request.body = _.toPlainObject(options.input);
          return await strapi.controllers.project.create(context);
      },
      updateOrgProject: async (obj, options, {
        context
      }) => {
        context.params = _.toPlainObject(options);
        context.request.body = _.toPlainObject(options.input);
        return await strapi.controllers.project.update(context);
      },
    },
  },
};
