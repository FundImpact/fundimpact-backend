const _ = require('lodash');
module.exports = {
  definition: `
  `,
  query: `
    impactCategoryOrgList(sort: String , limit: Int, start: Int, where: JSON): [ImpactCategoryOrg]
    impactCategoryOrgCount(where : JSON) : Int!
    projectCountImpCatByOrg(where : JSON) : JSON!
    projectCountImpUnit(where : JSON ) : JSON!
    totalImpactProjectByOrg(where : JSON) : JSON!
    totalAchivedImpactProjectByOrg(where : JSON) : JSON!
    avgAchivementImpactByOrg(where : JSON) : JSON!
    achiveImpactVsTargetByOrg(where : JSON) : JSON!
    impactCategoryProjectCount(where : JSON) : JSON!
    impactCategoryAchievedValue(where : JSON) : JSON!`,

  mutation: `
        createImpactCategoryOrgInput(input: ImpactCategoryOrgInput): ImpactCategoryOrg!,
        updateImpactCategoryOrgInput(id: ID!, input: ImpactCategoryOrgInput): ImpactCategoryOrg!
    `,
  resolver: {
    Query: {
      impactCategoryOrgList: {
        policies: ['application::impact-category-org.addFilter'],
        resolver: 'application::impact-category-org.impact-category-org.find'
      },
      impactCategoryOrgCount: {
        policies: ['application::impact-category-org.addFilter'],
        resolver: 'application::impact-category-org.impact-category-org.count'
      },
      projectCountImpCatByOrg: {
        policies: ['application::impact-category-org.addFilter'],
        resolverOf: 'application::impact-category-org.impact-category-org.projectCountImpCatByOrg',
        resolver: async (obj, options, { context }) => {
          context.params = _.toPlainObject(options);
          context.request.body = _.toPlainObject(options.input);
          return await strapi.controllers['impact-category-org'].projectCountImpCatByOrg(context);
        }
      },
      projectCountImpUnit: {
        policies: ['application::impact-category-org.addFilter'],
        resolverOf: 'application::impact-category-org.impact-category-org.projectCountImpUnit',
        resolver: async (obj, options, { context }) => {
          context.params = _.toPlainObject(options);
          context.request.body = _.toPlainObject(options.input);
          return await strapi.controllers['impact-category-org'].projectCountImpUnit(context);
        }
      },
      totalImpactProjectByOrg: {
        policies: ['application::impact-category-org.addFilter'],
        resolverOf: 'application::impact-category-org.impact-category-org.totalImpactProjectByOrg',
        resolver: async (obj, options, { context }) => {
          context.params = _.toPlainObject(options);
          context.request.body = _.toPlainObject(options.input);
          return await strapi.controllers['impact-category-org'].totalImpactProjectByOrg(context);
        }
      },
      totalAchivedImpactProjectByOrg: {
        policies: ['application::impact-category-org.addFilter'],
        resolverOf: 'application::impact-category-org.impact-category-org.totalAchivedImpactProjectByOrg',
        resolver: async (obj, options, { context }) => {
          context.params = _.toPlainObject(options);
          context.request.body = _.toPlainObject(options.input);
          return await strapi.controllers['impact-category-org'].totalAchivedImpactProjectByOrg(context);
        }
      },
      avgAchivementImpactByOrg: {
        policies: ['application::impact-category-org.addFilter'],
        resolverOf: 'application::impact-category-org.impact-category-org.avgAchivementImpactByOrg',
        resolver: async (obj, options, { context }) => {
          context.params = _.toPlainObject(options);
          context.request.body = _.toPlainObject(options.input);
          return await strapi.controllers['impact-category-org'].avgAchivementImpactByOrg(context);
        }
      },
      achiveImpactVsTargetByOrg: {
        policies: ['application::impact-category-org.addFilter'],
        resolverOf: 'application::impact-category-org.impact-category-org.achiveImpactVsTargetByOrg',
        resolver: async (obj, options, { context }) => {
          context.params = _.toPlainObject(options);
          context.request.body = _.toPlainObject(options.input);
          return await strapi.controllers['impact-category-org'].achiveImpactVsTargetByOrg(context);
        }
      },
      impactCategoryProjectCount: {
        policies: ['application::impact-category-org.addFilter'],
        resolverOf: 'application::impact-category-org.impact-category-org.impact_category_project_count',
        resolver: async (obj, options, { context }) => {
          context.params = _.toPlainObject(options);
          context.request.body = _.toPlainObject(options.input);
          return await strapi.controllers['impact-category-org'].impact_category_project_count(context);
        }
      },
      impactCategoryAchievedValue: {
        policies: ['application::impact-category-org.addFilter'],
        resolverOf: 'application::impact-category-org.impact-category-org.impact_category_achieved_value',
        resolver: async (obj, options, { context }) => {
          context.params = _.toPlainObject(options);
          context.request.body = _.toPlainObject(options.input);
          return await strapi.controllers['impact-category-org'].impact_category_achieved_value(context);
        }
      }
    },
    Mutation: {
      createImpactCategoryOrgInput: {
        resolverOf: "application::impact-category-org.impact-category-org.create",
        resolver: async (obj, options, { context }) => {
          context.params = _.toPlainObject(options);
          context.request.body = _.toPlainObject(options.input);
          return await strapi.controllers['impact-category-org'].create(context);
        }
      },
      updateImpactCategoryOrgInput: {
        resolverOf: "application::impact-category-org.impact-category-org.update",
        resolver: async (obj, options, { context }) => {
          context.params = _.toPlainObject(options);
          context.request.body = _.toPlainObject(options.input);
          return await strapi.controllers['impact-category-org'].update(context);
        }
      }
    }
  },

}