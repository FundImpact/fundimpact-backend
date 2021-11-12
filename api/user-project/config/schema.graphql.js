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
    orgUserProject(where: JSON): [UserProject]
    orgUserProjectCount(where: JSON): JSON
  `,
  mutation: `
    createOrgUserProject(input: UserProjectInput): UserProject
    updateOrgUserProject(id: ID!, input: UserProjectInput): UserProject
    deleteOrgUserProject(id: ID!, input: UserProjectInput): UserProject
  `,
  resolver: {
    Query: {
      orgUserProject: {
        policies: ['application::user-project.addFilter'],
        resolver: 'application::user-project.user-project.find',
      },
      orgUserProjectCount: {
        policies: ['application::user-project.addFilter'],
        resolver: 'application::user-project.user-project.count',
      }
    },
    Mutation: {
      createOrgUserProject: {
        resolverOf: "application::project.project.create",
        resolver: async (obj, options, { context }) => {
          context.params = _.toPlainObject(options);
          context.request.body = _.toPlainObject(options.input);
          return await strapi.controllers["user-project"].create(context);
        }
      },
      updateOrgUserProject: {
        resolverOf: "application::project.project.update",
        resolver: async (obj, options, { context }) => {
          context.params = _.toPlainObject(options);
          context.request.body = _.toPlainObject(options.input);
          return await strapi.controllers["user-project"].update(context);
        }
      },
      deleteOrgUserProject: {
        resolverOf: "application::project.user-project.delete",
        resolver: async (obj, options, { context }) => {
          context.params = _.toPlainObject(options);
          context.request.body = _.toPlainObject(options.input);
          return await strapi.controllers["user-project"].delete(context);
        }
      }
    },
  },
};
