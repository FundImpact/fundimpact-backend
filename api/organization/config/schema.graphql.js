const _ = require('lodash');
module.exports = {
    definition: ``,
    query: ``,
    mutation: ``,
    resolver: {
        Query: {
            organizations: {
                policies: ['application::organization.addFilter'],
                resolver: 'application::organization.organization.find'
            }
        }
    }
}