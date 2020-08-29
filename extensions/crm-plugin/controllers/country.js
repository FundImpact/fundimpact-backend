"use strict";
/* jshint node:true */

/**
 * Village
 *
 * API: Village
 *
 * @description: Village stores village information belonging to a specific district.
 */
module.exports = {
    find: async ctx => {
        try {
        // ctx.query._q: filter parameters in context object
        if (ctx.query._q) {
          // checks if any filter parameter is present
          return await strapi.query("country", "crm-plugin").search(ctx.query);
        } else {
          // returns all data if no filter parameter is passed
          return await strapi.query("country", "crm-plugin").find(ctx.query);
        }
      } catch (error) {
        return ctx.badRequest(null, error.message);
      }
    },
    findOne: async ctx => {
      const { id } = ctx.params; // get id from context object
      try {
        return await strapi
          .query("country", "crm-plugin")
          .findOne({ id });
      } catch (error) {
        return ctx.badRequest(null, error.message);
      }
    },
    create: async ctx => {
      try {
        return await strapi
          .query("country", "crm-plugin")
          .create(ctx.request.body);
  
      } catch (error) {
        return ctx.badRequest(null, error.message);
      }
    },
    update: async ctx => {
      try {
        const { id } = ctx.params;
        return await strapi
          .query("country", "crm-plugin")
          .update({ id }, ctx.request.body);
  
      } catch (error) {
        return ctx.badRequest(null, error.message);
      }
    }
};
