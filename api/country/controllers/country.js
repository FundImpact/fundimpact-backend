'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/v3.x/concepts/controllers.html#core-controllers)
 * to customize this controller
 */

module.exports = {
    find: async ctx => {
        try {
            // returns all data if no filter parameter is passed
            let country = await strapi.query("country", "crm-plugin").find(ctx.query);
            return country;
        } catch (error) {
            return ctx.badRequest(null, error.message);
        }
    },
};
