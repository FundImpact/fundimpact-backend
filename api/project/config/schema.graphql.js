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
    orgProject(sort:String,where: JSON): [Project]
    orgProjectCount(where: JSON): JSON
  `,
  mutation: `
    createOrgProject(input: ProjectInput): Project
    updateOrgProject(id: ID!, input: ProjectInput): Project
  `,
  resolver: {
    Query: {
      projects: {
        policies: ['application::project.addFilter'],
        resolver: 'application::project.project.find',
      },
      orgProject: {
        policies: ['application::project.addFilter'],
        resolver: 'application::project.project.find',
      },
      orgProjectCount: {
        policies: ['application::project.addFilter'],
        resolver: 'application::project.project.count',
      }
    },
    Mutation: {
      createOrgProject: {
        resolverOf: "application::project.project.create",
        resolver: async (obj, options, { context }) => {
          context.params = _.toPlainObject(options);
          context.request.body = _.toPlainObject(options.input);
          return await strapi.controllers.project.create(context);
        }
      },
      updateOrgProject: {
        resolverOf: "application::project.project.update",
        resolver: async (obj, options, { context }) => {
          context.params = _.toPlainObject(options);
          context.request.body = _.toPlainObject(options.input);
          return await strapi.controllers.project.update(context);
        }
      }
    },
  },
};
