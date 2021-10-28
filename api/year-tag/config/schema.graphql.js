module.exports = {
    query: `
      yearTagCount(where: JSON): Int!
    `,
    resolver: {
        Query: {
            yearTagCount: {
                description: 'Return the count of year tag',
                resolverOf: 'application::year-tag.count',
                resolver: async (obj, options, ctx) => {
                    return await strapi.api['year-tag'].services['year-tag'].count(options.where || {});
                },
            },
        },
    },
};