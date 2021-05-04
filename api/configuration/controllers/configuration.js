"use strict";

/**
 * Read the documentation (https://strapi.io/documentation/v3.x/concepts/controllers.html#core-controllers)
 * to customize this controller
 */
const _ = require("lodash");
const permissions = require("../../../services/helper/permissions");
const permissionsService = require("../../../services/helper/permissions");
const axios = require("axios");

module.exports = {
  async permissions(ctx) {
    try {
      let permissions = await permissionsService.createAdminPermissions({
        enabled: false,
        purpose: "ORGROLECREATION",
      });
      ctx.send({ permissions });
    } catch (err) {
      strapi.log.error(err);
      return ctx.throw(400, err);
    }
  },
  async fetchRolesFromOneEnvAndSubmitInOtherEnv(ctx) {
    try {
      const {
        request: {
          body: { fetchRolesFrom, roles, authorizationHeader },
        },
      } = ctx;
      const fetchedRoles = await Promise.all(
        roles.map((role) =>
          axios.get(`${fetchRolesFrom}/users-permissions/roles/${role}`, {
            headers: {
              Authorization: authorizationHeader,
            },
          })
        )
      );
      await createFetchedRoles(fetchedRoles);
      return ctx.send({ message: "roles created" });
    } catch (err) {
      strapi.log.error(err);
      return ctx.throw(400, err);
    }
  },
};

const createFetchedRoles = async (fetchedRoles) => {
  for (const fetchedRole of fetchedRoles) {
    const {
      data: { role },
    } = fetchedRole;
    await strapi.plugins[
      "users-permissions"
    ].services.userspermissions.createRole({
      name: role.name,
      description: role.description,
      type: role.type,
      is_project_level: role.is_project_level,
      sequence: role.sequence,
      permissions: role.permissions,
    });
  }
};
