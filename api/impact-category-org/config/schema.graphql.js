const _ = require('lodash');
module.exports = {
    definition: `
  `,
    query: `
    impactCategoryOrgList(where: JSON): [ImpactCategoryOrg]
  `,
    mutation:`
        createImpactCategoryOrgInput(input: ImpactCategoryOrgInput): ImpactCategoryOrg!,
        updateImpactCategoryOrgInput(id: ID!, input: ImpactCategoryOrgInput): ImpactCategoryOrg!
    `,
    resolver: {
        Query: {
            impactCategoryOrgList: {
              policies: ['application::impact-category-org.addFilter'],
              resolver: 'application::impact-category-org.impact-category-org.find'
            }
        },
        Mutation: {
            createImpactCategoryOrgInput: async (obj, options, { context }) => {
                context.params = _.toPlainObject(options);
                context.request.body = _.toPlainObject(options.input);
                return await strapi.controllers['impact-category-org'].create(context);
            },
            updateImpactCategoryOrgInput: async (obj, options, { context }) => {
              context.params = _.toPlainObject(options);
              context.request.body = _.toPlainObject(options.input);
              return await strapi.controllers['impact-category-org'].update(context);
            }
        }
    },
    
}