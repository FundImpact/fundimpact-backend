'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/v3.x/concepts/controllers.html#core-controllers)
 * to customize this controller
 */

module.exports = {
    async donors(ctx){
        let data = await strapi.connections.default.raw(`SELECT * FROM donors;`)
        return data.rows && data.rows.length > 0 ? data.rows : [];
    }
};
