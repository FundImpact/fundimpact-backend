const _ = require('lodash');
module.exports = {
    definition: ``,
    query: `
      yearTagCount(where: JSON): Int!
      yearTagDonor(id: ID):[YearTag]
      yearTagOrganization(id: ID):[YearTag]`,
    mutation: ``,
    resolver: {
        Query: {
            yearTagCount: {
                description: 'Return the count of year tag',
                resolverOf: 'application::year-tag.count',
                resolver: async (obj, options, ctx) => {
                    return await strapi.api['year-tag'].services['year-tag'].count(options.where || {});
                },
            },
            yearTagDonor: {
                resolver: 'application::year-tag.year-tag.donerWiseYearTag'
            },
            yearTagOrganization: {
                resolver: 'application::year-tag.year-tag.organizationWiseYearTag'
            }
        },
    },
};


// module.exports = {
//     query: `
//       yearTagCount(where: JSON): Int!
//     `,
//     resolver: {
//         Query: {
//             yearTagCount: {
//                 description: 'Return the count of year tag',
//                 resolverOf: 'application::year-tag.count',
//                 resolver: async (obj, options, ctx) => {
//                     return await strapi.api['year-tag'].services['year-tag'].count(options.where || {});
//                 },
//             }
//         },
//     },
// };


// yearTagDonor: {
//     resolver: 'application::year-tag.donerWiseYearTag'
// }