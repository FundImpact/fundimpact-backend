const _ = require('lodash');
module.exports = {
    definition: `
  `,
    query: `
    grantPeriodsProjectList: [GrantPeriodsProject]
  `,
    mutation: `
        createGrantPeriodsProjectDetail(input: GrantPeriodsProjectInput): GrantPeriodsProject!,
        updateGrantPeriodsProjectDetail(id: ID!, input: GrantPeriodsProjectInput): GrantPeriodsProject!
    `,
    resolver: {
        Query: {
            grantPeriodsProjectList: {
                // policies: ['application::donors.addFilter'],
                resolver: 'application::grant-periods-project.grant-periods-project.find'
            }
        },
        Mutation: {
            createGrantPeriodsProjectDetail: async (obj, options, {context }) => {
                context.params = _.toPlainObject(options);
                context.request.body = _.toPlainObject(options.input);
                return await strapi.controllers['grant-periods-project'].create(context);
            },
            updateGrantPeriodsProjectDetail: async (obj, options, {context }) => {
                context.params = _.toPlainObject(options);
                context.request.body = _.toPlainObject(options.input);
                return await strapi.controllers['grant-periods-project'].update(context);
            }
        }
    },

}