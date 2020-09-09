const _ = require('lodash');
module.exports = {
  definition: `
  `,
  query: `
    impactCategoryUnitList(sort: String , limit: Int, start: Int, where: JSON): [ImpactCategoryUnit]
    impactCategoryUnitListCount(where : JSON) : Int!
  `,
  mutation: `
        createImpactCategoryUnitInput(input: ImpactCategoryUnitInput): ImpactCategoryUnit!,
        updateImpactCategoryUnitInput(id: ID!, input: ImpactCategoryUnitInput): ImpactCategoryUnit!
    `,
  resolver: {
    Query: {
      impactCategoryUnitList: {
        policies: ['application::impact-category-unit.addFilter'],
        resolver: 'application::impact-category-unit.impact-category-unit.find'
      },
      impactCategoryUnitListCount: {
        policies: ['application::impact-category-unit.addFilter'],
        resolver: 'application::impact-category-unit.impact-category-unit.count'
      }
    },
    Mutation: {
      createImpactCategoryUnitInput: async (obj, options, { context }) => {
        context.params = _.toPlainObject(options);
        context.request.body = _.toPlainObject(options.input);
        return await strapi.controllers['impact-category-unit'].create(context);
      },
      updateImpactCategoryUnitInput: async (obj, options, { context }) => {
        context.params = _.toPlainObject(options);
        context.request.body = _.toPlainObject(options.input);
        return await strapi.controllers['impact-category-unit'].update(context);
      }
    }
  },

}