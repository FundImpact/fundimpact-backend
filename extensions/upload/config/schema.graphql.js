const _ = require("lodash");
module.exports = {
  type: {
    UsersPermissionsPermission: false, // Make this type NOT queriable.
  },
  definition: `
    input inputFileMorph{
        ref:String!
        refId:ID!
        field:String!
        order:Int
    }

    type ATTACHMENT {
      id: ID!
			name: String!
			size: Float
			caption: String!
			url: String!
			ext: String!
			created_at: Date!,
      related_type: String!,
      related_id: Int!
    }
  `,
  query: `
    attachmentsInProjectBudgetDeliverableAndImpact(project: ID!): [ATTACHMENT]!
  `,
  mutation: `
    createFileMorph(id:ID!, input:inputFileMorph):UploadFile
    deleteFileMorph(id:ID!):UploadFile
  `,
  resolver: {
    Query: {
      attachmentsInProjectBudgetDeliverableAndImpact: {
        policies: [],
        resolverOf:
          "plugins::upload.upload.getAttachmentsInProjectBudgetDeliverableAndImpact",
        resolver: async (obj, options, { context }) => {
          context.params = _.toPlainObject(options);
          return await strapi.plugins.upload.controllers.upload.getAttachmentsInProjectBudgetDeliverableAndImpact(
            context
          );
        },
      },
    },
    Mutation: {
      createFileMorph: {
        resolver: "plugins::upload.upload.createFileMorph",
      },
      deleteFileMorph: {
        resolver: "plugins::upload.upload.deleteFileMorph",
      },
    },
  },
};
