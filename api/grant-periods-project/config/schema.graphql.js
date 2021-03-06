const _ = require('lodash');
module.exports = {
    definition: `
  `,
    query: `
    grantPeriodsProjectList(where: JSON): [GrantPeriodsProject]
  `,
    mutation: `
        createGrantPeriodsProjectDetail(input: GrantPeriodsProjectInput): GrantPeriodsProject!,
        updateGrantPeriodsProjectDetail(id: ID!, input: GrantPeriodsProjectInput): GrantPeriodsProject!
    `,
    resolver: {
        Query: {
            grantPeriodsProjectList: {
                policies: ['application::grant-periods-project.addFilter'],
                resolver: 'application::grant-periods-project.grant-periods-project.find'
            }
        },
        Mutation: {
            createGrantPeriodsProjectDetail: {
                resolverOf: "application::grant-periods-project.grant-periods-project.create",
                resolver: async (obj, options, { context }) => {
                    context.params = _.toPlainObject(options);
                    context.request.body = _.toPlainObject(options.input);
                    return await strapi.controllers['grant-periods-project'].create(context);
                }
            },
            updateGrantPeriodsProjectDetail:{
                resolverOf: "application::grant-periods-project.grant-periods-project.update",
                policies: ["application::grant-periods-project.isGrantPeriodAssociatedWithOtherTable"],
                resolver:  async (obj, options, { context }) => {
                    context.params = _.toPlainObject(options);
                    context.request.body = _.toPlainObject(options.input);
                    return await strapi.controllers['grant-periods-project'].update(context);
                }
            }
        }
    },

}