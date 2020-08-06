const _ = require('lodash');

function checkBadRequest(contextBody) {
    if (_.get(contextBody, 'statusCode', 200) !== 200) {
        const message = _.get(contextBody, 'error', 'Bad Request');
        const exception = new Error(message);
        exception.code = _.get(contextBody, 'statusCode', 400);
        exception.data = contextBody;
        throw exception;
    }
}

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
                name: String,
                contact: String,
                created_at: String,
                updated_at: String
            }

            input AddContactInput {
                name: String
                phone: String
                email: String
                contact_type: String

            }
    `,
    query: `
    contactList: [ContactList]
    `,
    mutation: `
        addContactInput(input: AddContactInput): ContactList
    `,
    resolver: {
        Query: {
            contactList: {
                resolverOf: 'plugins::crm-plugin.contact.find',
                resolver: async (obj, options, { context }) => {
                    let result = await strapi.plugins['crm-plugin'].controllers.contact.find(context);
                    //let output = context.body ? context.body.toJSON() : context.body;
                    console.log("output", result)
                    //checkBadRequest(output);
                    return result;
                }
            },
        },
        Mutation: {
            addContactInput: {
                resolverOf: 'plugins::crm-plugin.contact.create',
                resolver: async (obj, options, { context }) => {
                    context.params = {
                        ...context.params,
                    };
                    context.request.body = _.toPlainObject(options.input);
                    let result = await strapi.plugins['crm-plugin'].controllers.contact.create(context);
                    //let output = context.body.toJSON ? context.body.toJSON() : context.body;
                    console.log("result" , result)
                    //checkBadRequest(output);
                    return result;
                },
            }
        }
    },
};
