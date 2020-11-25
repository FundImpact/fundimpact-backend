const _ = require('lodash');
module.exports = {
  type: {
    UsersPermissionsPermission: false, // Make this type NOT queriable.
  },
  definition:`
    input inputFileMorph{
        ref:String!
        refId:ID!
        field:String!
        order:Int
    }
  `,
  query: ``,
  mutation:`
    createFileMorph(id:ID!, input:inputFileMorph):UploadFile
    deleteFileMorph(id:ID!):UploadFile
  `,
  resolver: {
    Query: {
    },
    Mutation: {
      createFileMorph:{
            resolver:'plugins::upload.upload.createFileMorph'
        },
        deleteFileMorph:{
            resolver:'plugins::upload.upload.deleteFileMorph'
        }
    },
  },
};
