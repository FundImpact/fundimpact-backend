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
            type ContactList {
                id: ID!
                name: String
                phone: String
                email: String
                contact_type: String
                organization: OrganizationList
                created_at: String
                updated_at: String
            }

            type OrganizationList {
                id: ID!
                name: String
                contact: String
                address: String
                account : AccountDetails
                organisation_registration_type : OrganizationRegistrationType
                short_name : String
                legal_name : String
                description : String
                contact_type: String
            }

            type AccountDetails {
                id : ID!
                account_no : Int
                name : String
                description : String
            }


            type OrganizationRegistrationType {
                id : ID!
                reg_type : String
            }


            input AddContactInput {
                name: String
                address: String
                account : String
                organisation_registration_type : Int
                short_name : String
                legal_name : String
                description : String
                contact_type: String
            }
    `,
    query: `
    contactList: [ContactList]
    `,
    mutation: `
        addContactDetail(input: AddContactInput): ContactList,
        updateContactDetail(id: ID!, input: ContactInput): ContactList
    `,
    resolver: {
        Query: {
            contactList: {
                resolver: 'plugins::crm-plugin.contact.find',
            },
        },
        Mutation: {
            addContactDetail: {
                resolverOf: 'plugins::crm-plugin.contact.create',
                resolver: async (obj, options, { context }) => {
                    context.params = {
                        ...context.params,
                    };
                    context.request.body = _.toPlainObject(options.input);
                    console.log("context" , context.params , context.request.body)
                    let result = await strapi.plugins['crm-plugin'].controllers.contact.create(context);
                    //let output = context.body.toJSON ? context.body.toJSON() : context.body;
                    console.log("result" , result)
                    //checkBadRequest(output);
                    return result;
                },
            },
            updateContactDetail : {
                resolverOf: 'plugins::crm-plugin.contact.update',
                resolver: async (obj, options, { context }) => {
                    context.params = { id : options.id};
                    context.request.body = _.toPlainObject(options.input);
                    let result = await strapi.plugins['crm-plugin'].controllers.contact.update(context);
                    //let output = context.body.toJSON ? context.body.toJSON() : context.body;
                    console.log("result" , result)
                    //checkBadRequest(output);
                    return result;
                }
            }
        }
    },
};
