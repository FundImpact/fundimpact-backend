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

module.exports = {};
