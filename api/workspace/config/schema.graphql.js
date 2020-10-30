const _ = require('lodash');
module.exports = {
  definition: `
    type OrgWorkspace {
      id: ID!,
      name: String!,
      short_name: String!
      description:String
      organization:Organization
    }
    input OrgWorkspaceInput {
        organization:ID!,
        name: String!,
        short_name: String!,
        description:String
    }
  `,
  query: `
    orgWorkspaces(where: JSON): [Workspace]
  `,
  mutation: `
        createOrgWorkspace(input: OrgWorkspaceInput): OrgWorkspace!,
        updateOrgWorkspace(id: ID!, input: OrgWorkspaceInput): OrgWorkspace!
    `,
  resolver: {
    Query: {
      workspaces: {
        policies: ['application::workspace.addFilter'],
        resolver: 'application::workspace.workspace.find'
      },
      orgWorkspaces: {
        policies: ['application::workspace.addFilter'],
        resolver: 'application::workspace.workspace.find'
      }
    },
    Mutation: {
      createOrgWorkspace: {
        resolverOf: "application::workspace.workspace.create",
        resolver: async (obj, options, { context }) => {
          context.params = _.toPlainObject(options);
          context.request.body = _.toPlainObject(options.input);
          return await strapi.controllers.workspace.create(context);
        }
      },
      updateOrgWorkspace: {
        resolverOf: "application::workspace.workspace.update",
        resolver: async (obj, options, { context }) => {
          context.params = _.toPlainObject(options);
          context.request.body = _.toPlainObject(options.input);
          return await strapi.controllers.workspace.update(context);
        }
      }
    }
  }
}