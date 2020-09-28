'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/v3.x/concepts/controllers.html#core-controllers)
 * to customize this controller
 */
const _ = require('lodash');
const permissions = require('../../../services/helper/permissions');
const permissionsService =  require('../../../services/helper/permissions');
module.exports = {
    async permissions(ctx) {
        try {
            let permissions = await permissionsService.createAdminPermissions();
            ctx.send(permissions);
        } catch (err) {
            strapi.log.error(err);
            return ctx.throw(400, err);
        }
    }
};
