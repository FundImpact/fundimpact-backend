const _ = require('lodash');
module.exports = {
  definition: `
  `,
  query: `
    impactTargetProjectList(sort: String , limit: Int, start: Int,where: JSON): [ImpactTargetProject]
    impactTargetProjectCount(where : JSON) : Int!
    impactTargetProjectTotalAmount(where : JSON) : Float!
    impactTargetProjectSuccessiveList(where : JSON) : JSON!
    impactAchieved(where : JSON) : JSON!
    impactTargetSdgCount (where : JSON) : JSON!
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
      impactTargetProjectSuccessiveList: async (obj, options, { context }) => {
        context.params = _.toPlainObject(options);
        context.request.body = _.toPlainObject(options.input);
        return await strapi.services['impact-target-project'].successiveImpactList(context);
      },
      impactAchieved: {
        policies: ['application::impact-target-project.addFilter'],
        resolverOf: 'application::impact-target-project.impact-target-project.impact_achieved',
        resolver: async (obj, options, { context }) => {
          context.params = _.toPlainObject(options);
          context.request.body = _.toPlainObject(options.input);
          return await strapi.controllers['impact-target-project'].impact_achieved(context);
        }
      },
      impactTargetSdgCount: {
        policies: ['application::impact-target-project.addFilter'],
        resolverOf: 'application::impact-target-project.impact-target-project.sdg_target_count',
        resolver: async (obj, options, { context }) => {
          context.params = _.toPlainObject(options);
          context.request.body = _.toPlainObject(options.input);
          return await strapi.controllers['impact-target-project'].sdg_target_count(context);
        }
      },
    },
    Mutation: {
      createImpactTargetProjectInput:{
        resolverOf: "application::impact-target-project.impact-target-project.create",
        resolver: async (obj, options, { context }) => {
          context.params = _.toPlainObject(options);
          context.request.body = _.toPlainObject(options.input);
          return await strapi.controllers['impact-target-project'].create(context);
        }
      },
      updateImpactTargetProjectInput:{
        resolverOf: "application::impact-target-project.impact-target-project.update",
        resolver: async (obj, options, { context }) => {
          context.params = _.toPlainObject(options);
          context.request.body = _.toPlainObject(options.input);
          return await strapi.controllers['impact-target-project'].update(context);
        }
      }
    }
  },

}