const _ = require('lodash');
module.exports = {
  definition: `
  `,
  query: `
    categoryUnitList(sort: String , limit: Int, start: Int, where: JSON): [CategoryUnit]
  `,
  mutation: `
        createCategoryUnitInput(input: CategoryUnitInput): CategoryUnit!,
        updateCategoryUnitInput(id: ID!, input: CategoryUnitInput): CategoryUnit!
    `,
  resolver: {
    Query: {
      categoryUnitList: {
        resolver: 'application::category-unit.category-unit.find'
      }
    },
    Mutation: {
      createCategoryUnitInput: async (obj, options, {
        context
      }) => {
        context.params = _.toPlainObject(options);
        context.request.body = _.toPlainObject(options.input);
        return await strapi.controllers['category-unit'].create(context);
      },
      updateCategoryUnitInput: async (obj, options, {
        context
      }) => {
        context.params = _.toPlainObject(options);
        context.request.body = _.toPlainObject(options.input);
        return await strapi.controllers['category-unit'].update(context);
      }
    }
  },

}