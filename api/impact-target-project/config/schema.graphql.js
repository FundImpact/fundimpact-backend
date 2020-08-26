const _ = require('lodash');
module.exports = {
  definition: `
  `,
  query: `
    impactTargetProjectList(sort: String , limit: Int, start: Int,where: JSON): [ImpactTargetProject]
    impactTargetProjectCount(where : JSON) : Int!
    impactTargetProjectTotalAmount(where : JSON) : Float!
  `,
  mutation: `
        createImpactTargetProjectInput(input: ImpactTargetProjectInput): ImpactTargetProject!,
        updateImpactTargetProjectInput(id: ID!, input: ImpactTargetProjectInput): ImpactTargetProject!
    `,
  resolver: {
    Query: {
      impactTargetProjectList: {
        policies: ['application::impact-target-project.addFilter'],
        resolver: 'application::impact-target-project.impact-target-project.find'
      },
      impactTargetProjectCount: {
        policies: ['application::impact-target-project.addFilter'],
        resolver: 'application::impact-target-project.impact-target-project.count'
      },
      impactTargetProjectTotalAmount: async (obj, options, { context }) => {
        context.params = _.toPlainObject(options);
        context.request.body = _.toPlainObject(options.input);
        return await strapi.services['impact-target-project'].totalImpactAmount(context);
    },
    },
    Mutation: {
      createImpactTargetProjectInput: async (obj, options, { context }) => {
        context.params = _.toPlainObject(options);
        context.request.body = _.toPlainObject(options.input);
        return await strapi.controllers['impact-target-project'].create(context);
      },
      updateImpactTargetProjectInput: async (obj, options, { context }) => {
        context.params = _.toPlainObject(options);
        context.request.body = _.toPlainObject(options.input);
        return await strapi.controllers['impact-target-project'].update(context);
      }
    }
  },

}