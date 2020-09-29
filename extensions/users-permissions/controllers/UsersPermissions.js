const _ = require('lodash');
const permissionsService =  require('../../../services/helper/permissions');
module.exports = {
  /**
   * Default action.
   *
   * @return {Object}
   */
    async createOrganizationRole(ctx) {
        if (_.isEmpty(ctx.request.body)) {
            return ctx.throw(400, `Cannot be empty.`);
            // return ctx.badRequest(null, [{ messages: [{ id: 'Cannot be empty' }] }]);
        }
        try {
            let payload = ctx.request.body.input;
            const organization = ctx.state.user.organization;
            const permissions = payload.permissions ? payload.permissions:await permissionsService.createAdminPermissions();
            const type = `${_.snakeCase(_.deburr(_.toLower(payload.name)))}-org-${organization}`;
            const roleParams = {
                name:payload.name,
                type:type,
                users:[],
                organization:organization,
                description:`Role (${type}).`,
                permissions:permissions
            };
            let roleQuery = {
                type: roleParams.type, 
                organization:roleParams.organization
            }
            const roleExists = await strapi.query('role', 'users-permissions').findOne(roleQuery,[]);
            if(roleExists){
                return ctx.throw(400, `Requested role is already exists.`);
                // return ctx.badRequest(null, [{ messages: [`Requested role is already exists.`] }]);
            }

            await strapi.plugins['users-permissions'].services.userspermissions.createRole(
                roleParams
            );
            const role = await strapi.query('role', 'users-permissions').findOne(roleQuery,[]);
            ctx.send(role);
        } catch (err) {
            strapi.log.error(err);
            return ctx.throw(400, err);
            //ctx.badRequest(null, [{ messages: [{ id: 'An error occured' }] }]);
        }
    },
    async getOrganizationRoles(ctx) {
        try {
            Object.assign(ctx.request.query,{organization:ctx.state.user.organization});
            const roles = await strapi.query('role', 'users-permissions').find(ctx.request.query, []);
            console.log(roles);
            ctx.send(roles);
        } catch (err) {
            //ctx.badRequest(null, [{ messages: [{ id: 'Not found' }] }]);
            return ctx.throw(400, err);
        }
    }
}