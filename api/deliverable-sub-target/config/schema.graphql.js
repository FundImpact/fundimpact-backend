const _ = require('lodash');
module.exports = {
    definition: ` `,
    query:`
        customDeliverableSubTargetsConnection(where : JSON) : JSON!
    `,
    resolver: {
        Query: {
            customDeliverableSubTargetsConnection: async (obj, options, { context }) => {
                context.params = _.toPlainObject(options);
                context.request.body = _.toPlainObject(options.input);
                return await strapi.services['deliverable-sub-target'].DeliverableSubTargetsConnection(context);
            }
        }
    },

}