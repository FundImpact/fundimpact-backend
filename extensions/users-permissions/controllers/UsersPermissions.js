const _ = require('lodash');
const permissionsService = require('../../../services/helper/permissions');
const { count } = require('./Auth');
module.exports = {
    /**
     * Default action.
     *
     * @return {Object}
     */
    async updateRole(ctx) {
        const roleID = ctx.params.role;

        if (_.isEmpty(ctx.request.body)) {
            return ctx.badRequest(null, [{ messages: [{ id: 'Bad request' }] }]);
        }

        try {
            await strapi.plugins['users-permissions'].services.userspermissions.updateRole(
                roleID,
                ctx.request.body
            );
            if (ctx.request.body.customFields) {
                await strapi.query('role', 'users-permissions').update({ id: roleID }, { ...ctx.request.body.customFields });
            }
            ctx.send({ ok: true });
        } catch (err) {
            strapi.log.error(err);
            ctx.badRequest(null, [{ messages: [{ id: 'An error occurred' }] }]);
        }
    },
    async createOrganizationRole(ctx) {
        if (_.isEmpty(ctx.request.body)) {
            return ctx.throw(400, `Cannot be empty.`);
            // return ctx.badRequest(null, [{ messages: [{ id: 'Cannot be empty' }] }]);
        }
        try {
            let payload = ctx.request.body.input;
            const organization = ctx.state.user.organization;
            const permissions = payload.permissions; // ? payload.permissions : await permissionsService.createAdminPermissions();
            if (!permissions) {
                return ctx.throw(400, `permissions are required to create role.`);
            }
            const type = `${_.snakeCase(_.deburr(_.toLower(payload.name)))}-org-${organization}`;
            const roleParams = {
                name: payload.name,
                is_project_level: payload.is_project_level,
                type: type,
                users: [],
                organization: organization,
                description: `Role (${type}).`,
                permissions: permissions
            };
            let roleQuery = {
                type: roleParams.type
            }
            const roleExists = await strapi.query('role', 'users-permissions').findOne(roleQuery, []);
            if (roleExists) {
                return ctx.throw(400, `Requested role is already exists.`);
            }
            await strapi.plugins['users-permissions'].services.userspermissions.createRole(
                roleParams
            );
            const role = await strapi.query('role', 'users-permissions').findOne(roleQuery, []);
            let q = { _limit: -1, role: role.id };
            const allocatedPermissions = await strapi.query('permission', 'users-permissions').find(q, []);
            let d = JSON.parse(JSON.stringify(role));
            d['permissions'] = allocatedPermissions;
            ctx.send(role);
        } catch (err) {
            strapi.log.error(err);
            return ctx.throw(400, err);
        }
    },
    async updateOrganizationRole(ctx) {
        if (_.isEmpty(ctx.request.body)) {
            return ctx.throw(400, `Cannot be empty.`);
            // return ctx.badRequest(null, [{ messages: [{ id: 'Cannot be empty' }] }]);
        }
        try {
            let roleId = ctx.request.body.id;
            let payload = ctx.request.body.input;
            if (!roleId) {
                return ctx.throw(400, `'id' is required field.`)
            }
            if (!payload.permissions) {
                delete payload.permissions;
            }
            await strapi.plugins['users-permissions'].services.userspermissions.updateRole(
                roleId,
                payload
            );
            const role = await strapi.query('role', 'users-permissions').findOne({ id: roleId }, []);
            let q = { _limit: -1, role: role.id };
            const allocatedPermissions = await strapi.query('permission', 'users-permissions').find(q, []);
            let d = JSON.parse(JSON.stringify(role));
            d['permissions'] = allocatedPermissions;
            return ctx.send(d);
        } catch (err) {
            strapi.log.error(err);
            return ctx.throw(400, err);
        }
    },
    async getOrganizationRoles(ctx) {
        try {
            Object.assign(ctx.request.query, { organization: ctx.state.user.organization });
            const roles = await strapi.query('role', 'users-permissions').find(ctx.request.query, []);
            ctx.send(roles);
        } catch (err) {
            //ctx.badRequest(null, [{ messages: [{ id: 'Not found' }] }]);
            return ctx.throw(400, err);
        }
    },

    async getRolesList(ctx) {
        try {
            // Object.assign(ctx.request.query, { organization: ctx.state.user.organization });
            const roles = await strapi.query('role', 'users-permissions').find();
            ctx.send(roles);
        } catch (err) {
            //ctx.badRequest(null, [{ messages: [{ id: 'Not found' }] }]);
            return ctx.throw(400, err);
        }
    },


    async getRolePemissions(ctx) {
        try {
            ctx.request.query._limit = -1;
            const permissions = await strapi.query('permission', 'users-permissions').find(ctx.request.query, []);
            let systemPlugins = ["proxy", "contenttypes", "builder", "contentmanager", "components", "connections"];
            let newPermissions = []
            for (let i = 0; i < permissions.length; i++) {
                if (!systemPlugins.includes(permissions[i].controller)) {
                    newPermissions.push(permissions[i])
                }
            }
            ctx.send(newPermissions);
        } catch (err) {
            return ctx.throw(400, err);
        }
    },
    async getOrganizationRolesCount(ctx) {
        try {
            Object.assign(ctx.request.query, { organization: ctx.state.user.organization });
            const count = await strapi.query('role', 'users-permissions').count(ctx.request.query, []);
            ctx.send({ count });
        } catch (err) {
            return ctx.throw(400, err);
        }
    }
}