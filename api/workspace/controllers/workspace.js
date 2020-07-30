'use strict';
const {
  sanitizeEntity
} = require('strapi-utils');
/**
 * Read the documentation (https://strapi.io/documentation/v3.x/concepts/controllers.html#core-controllers)
 * to customize this controller
 */

module.exports = {
  async find(ctx) {
    let entities;
    try {
      if (ctx.query && ctx.query._q) {
        entities = await strapi.services.workspace.search(ctx.query, 'organisation');
      } else {
        entities = await strapi.services.workspace.find(ctx.query, 'organisation');
      }
      return entities.map(entity => sanitizeEntity(entity, {
        model: strapi.models.workspace
      }));
      
    } catch (error) {
      console.log("Exception",error)
    }
  },
};
