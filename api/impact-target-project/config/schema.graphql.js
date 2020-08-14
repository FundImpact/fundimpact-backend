const _ = require('lodash');
module.exports = {
  definition: `
  `,
  query: `
    impactTargetProjectList(where: JSON): [ImpactTargetProject]
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
      }
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