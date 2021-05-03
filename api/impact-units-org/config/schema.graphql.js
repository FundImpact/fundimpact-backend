const _ = require('lodash');
module.exports = {
  definition: `
  `,
  query: `
    impactUnitsOrgList(sort: String , limit: Int, start: Int, where: JSON): [ImpactUnitsOrg]
    impactUnitsOrgCount(where : JSON) : Int!
  `,
  mutation: `
        createImpactUnitsOrgInput(input: ImpactUnitsOrgInput): ImpactUnitsOrg!,
        updateImpactUnitsOrgInput(id: ID!, input: ImpactUnitsOrgInput): ImpactUnitsOrg!
    `,
  resolver: {
    Query: {
      impactUnitsOrgList: {
        policies: ['application::impact-units-org.addFilter'],
        resolver: 'application::impact-units-org.impact-units-org.find'
      },
      impactUnitsOrgCount: {
        policies: ['application::impact-units-org.addFilter'],
        resolver: 'application::impact-units-org.impact-units-org.count'
      }
    },
    Mutation: {
      createImpactUnitsOrgInput:{
        resolverOf: "application::impact-units-org.impact-units-org.create",
        resolver: async (obj, options, { context }) => {
          context.params = _.toPlainObject(options);
          context.request.body = _.toPlainObject(options.input);
          return await strapi.controllers['impact-units-org'].create(context);
        }
      },
      updateImpactUnitsOrgInput:{
        resolverOf: "application::impact-units-org.impact-units-org.update",
        policies: ['application::impact-units-org.isImpactUnitAssociatedWithImpactTarget'],
        resolver:  async (obj, options, { context }) => {
          context.params = _.toPlainObject(options);
          context.request.body = _.toPlainObject(options.input);
          return await strapi.controllers['impact-units-org'].update(context);
        }
      }
    }
  },

}