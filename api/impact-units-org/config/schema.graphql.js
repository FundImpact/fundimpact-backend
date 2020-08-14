const _ = require('lodash');
module.exports = {
    definition: `
  `,
    query: `
    impactUnitsOrgList(where: JSON): [ImpactUnitsOrg]
  `,
    mutation:`
        createImpactUnitsOrgInput(input: ImpactUnitsOrgInput): ImpactUnitsOrg!,
        updateImpactUnitsOrgInput(id: ID!, input: ImpactUnitsOrgInput): ImpactUnitsOrg!
    `,
    resolver: {
        Query: {
          impactUnitsOrgList: {
              policies: ['application::impact-units-org.addFilter'],
              resolver: 'application::impact-units-org.impact-units-org.find'
            }
        },
        Mutation: {
            createImpactUnitsOrgInput: async (obj, options, { context }) => {
                context.params = _.toPlainObject(options);
                context.request.body = _.toPlainObject(options.input);
                return await strapi.controllers['impact-units-org'].create(context);
            },
            updateImpactUnitsOrgInput: async (obj, options, { context }) => {
              context.params = _.toPlainObject(options);
              context.request.body = _.toPlainObject(options.input);
              return await strapi.controllers['impact-units-org'].update(context);
            }
        }
    },
    
}