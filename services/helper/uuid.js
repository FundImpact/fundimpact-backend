const uuid = require('uuid');
module.exports = {
    async generateUuid() {
        return uuid.v4();
    }
}