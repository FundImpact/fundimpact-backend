'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/v3.x/concepts/controllers.html#core-controllers)
 * to customize this controller
 */
const {
    sanitizeEntity
} = require('strapi-utils');


const formatError = error => [{
    messages: [{
        id: error.id,
        message: error.message,
        field: error.field
    }]
},];

module.exports = {
    /**
   * Create a record.
   *
   * @return {Object}
   */

    async create(ctx) {
        try {
            let params = ctx.request.body;
            params['account'] = ctx.state.user.account;
            const organisation = await strapi.query('organisation').create(params);
            console.log("organisation", organisation)
            const sanitizedOrg = sanitizeEntity(organisation.toJSON ? organisation.toJSON() : organisation, {
                model: strapi.query('organisation').model,
            });
            console.log("sanitizedOrg", sanitizedOrg)
            return ctx.send({
                organisation: sanitizedOrg,
            });
        } catch (error) {
            return ctx.badRequest(null, formatError(error.message));
        }
    },

    async update(ctx) {
        try {
            const { id } = ctx.params;
            let entity = await strapi.query('organisation').update({ id }, ctx.request.body);
            console.log("entity" , entity)

            const updateOrg = sanitizeEntity(entity.toJSON ? entity.toJSON() : entity, {
                model: strapi.query('organisation').model,
            });
            console.log("updateOrg", updateOrg)
            return ctx.send({
                organisation: updateOrg,
            });
        } catch (err) {
            return ctx.badRequest(null, formatError(err.message));
        }
    }
};
