'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/v3.x/concepts/controllers.html#core-controllers)
 * to customize this controller
 */
const {
  sanitizeEntity
} = require('strapi-utils');
module.exports = {
async find(ctx) {
    console.log(ctx.query);
    
  let entities;
  if (ctx.query._q) {
    entities = await strapi.services.project.search(ctx.query);
  } else {
    entities = await strapi.services.project.find(ctx.query);
  }

  return entities.map(entity => sanitizeEntity(entity, {
    model: strapi.models.project
  }));
},
};
