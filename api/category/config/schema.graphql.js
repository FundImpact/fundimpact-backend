const _ = require('lodash');
module.exports = {
  definition: `
  `,
  query: `
    categoryList(sort: String , limit: Int, start: Int, where: JSON): [Category]
  `,
  mutation: `
        createCategoryInput(input: CategoryInput): Category!,
        updateCategoryInput(id: ID!, input: CategoryInput): Category!
    `,
  resolver: {
    Query: {
      categoryList: {
        resolver: 'application::category.category.find'
      }
    },
    Mutation: {
      createCategoryInput: async (obj, options, {
        context
      }) => {
        context.params = _.toPlainObject(options);
        context.request.body = _.toPlainObject(options.input);
        return await strapi.controllers['category'].create(context);
      },
      updateCategoryInput: async (obj, options, {
        context
      }) => {
        context.params = _.toPlainObject(options);
        context.request.body = _.toPlainObject(options.input);
        return await strapi.controllers['category'].update(context);
      }
    }
  },

}