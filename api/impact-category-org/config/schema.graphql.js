// const _ = require('lodash');
// module.exports = {
//     definition: `
//   `,
//     query: `
//     orgDonors(where: JSON): [ImpactCategoryOrg]
//   `,
//     mutation:`
//         createOrgDonor(input: DonorInput): ImpactCategoryOrg!,
//         updateOrgDonor(id: ID!, input: DonorInput): ImpactCategoryOrg!
//     `,
//     resolver: {
//         Query: {
//           orgDonors: {
//               policies: ['application::donor.addFilter'],
//               resolver: 'application::donor.donor.find'
//             }
//         },
//         Mutation: {
//           createOrgDonor: async (obj, options, {
//                 context
//             }) => {
//                 context.params = _.toPlainObject(options);
//                 context.request.body = _.toPlainObject(options.input);
//                 return await strapi.controllers.donor.create(context);
//             },
//             updateOrgDonor: async (obj, options, {
//               context
//             }) => {
//               context.params = _.toPlainObject(options);
//               context.request.body = _.toPlainObject(options.input);
//               return await strapi.controllers.donor.update(context);
//             }
//         }
//     },
    
// }