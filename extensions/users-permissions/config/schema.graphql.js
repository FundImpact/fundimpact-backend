const _ = require('lodash');
const { inviteUser } = require('../controllers/Auth');

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
   type userDetail{
    id : ID
    confirmed : Boolean
    email : String
    role : roleDetail
   }
   type roleDetail {
     id : ID,
     name : String
   }
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
    type InviteUser{
      id:ID
      email:String
      message:String
    }
    input UserCustomerInput {
      email: String
      password: String
    }
    type UserCustomerLogin {
      jwt: String
      user: UserCustomer!
    }
    input resetPasswordInput{
      password : String!
      passwordConfirmation : String!
    } 
    input inviteUserInput{
      email:String!
      role:ID!
      redirectTo:String
    }
    input organizationUserRoleInput{
      name:String!
      is_project_level:Boolean
      description:String
      permissions:JSON
    }
  `,
  query: `
   userCustomer: UsersPermissionsUser
   organizationRoles(
      sort:String
      limit: Int
      start: Int
      where: JSON
    ):[UsersPermissionsRole]
    organizationRolesCount(
      where: JSON
    ):JSON
    userList(sort:String ,limit: Int ,start: Int,  where : JSON) :[UsersPermissionsUser]
    userListCount(where : JSON) : Int!
    getRolePemissions(where : JSON) : [UsersPermissionsPermission],
    getRolesList(where : JSON) : [UsersPermissionsRole]
  `,
  mutation: `
  userCustomerLogin(email: String, password: String): UserCustomerLogin
  updateUserCustomerInput(id: ID!, input: editUserInput): UsersPermissionsUser!
  resetUserPasswordInput(id : ID!, input : resetPasswordInput) : UsersPermissionsUser!
  inviteUser(input:inviteUserInput): InviteUser
  createOrganizationUserRole(input:organizationUserRoleInput):UsersPermissionsRole
  updateOrganizationUserRole(id: ID!, input:organizationUserRoleInput):UsersPermissionsRole
  `,
  resolver: {
    Query: {
      userCustomer: {
        resolver: 'plugins::users-permissions.user.me',
      },
      organizationRoles:{
        resolver:'plugins::users-permissions.userspermissions.getOrganizationRoles',
      },
      getRolesList:{
        resolver:'plugins::users-permissions.userspermissions.getRolesList',
      },
      organizationRolesCount:{
        resolver:'plugins::users-permissions.userspermissions.getOrganizationRolesCount',
      },
      // getPermissionList :{
      //   resolver:'plugins::users-permissions.userspermissions.getPermissions',
      // },
      getRolePemissions : {
        resolver:'plugins::users-permissions.userspermissions.getRolePemissions',
      },
      userList: {
        policies: ['plugins::users-permissions.addFilter'],
        resolver: 'plugins::users-permissions.auth.list'
      },
      userListCount : {
        policies: ['plugins::users-permissions.addFilter'],
        resolver: 'plugins::users-permissions.auth.count'
      }
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
      updateUserCustomerInput: async (obj, options, {
        context
      }) => {
        context.params = _.toPlainObject(options);
        context.request.body = _.toPlainObject(options.input);
        return await strapi.plugins['users-permissions'].controllers.auth.update(context);
      },
      resetUserPasswordInput : async (obj, options, {
        context
      }) => {
        context.params = _.toPlainObject(options);
        context.request.body = _.toPlainObject(options.input);
        return await strapi.plugins['users-permissions'].controllers.auth.resetPassword(context);
      },
      inviteUser: {
        resolver:'plugins::users-permissions.auth.inviteUser'
      },
      createOrganizationUserRole:{
        resolver:'plugins::users-permissions.userspermissions.createOrganizationRole'
      },
      updateOrganizationUserRole:{
        resolver:'plugins::users-permissions.userspermissions.updateOrganizationRole'
      }
    },
  },
};
