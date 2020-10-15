const Strapi = require("strapi");
const http = require("http");
// above require creates a global named `strapi` that is an instance of Strapi 

let instance; // singleton 
function randomNum() {
  return Math.floor((Math.random() * 100000) + 1);
}
async function setupStrapi() {
  if (!instance) {
    await Strapi().load();
    instance = strapi;
    instance.app
      .use(instance.router.routes()) // this code in copied from app/node_modules/strapi/lib/Strapi.js
      .use(instance.router.allowedMethods());
      instance.server = http.createServer(instance.app.callback());
  }
  let n = randomNum();
  instance.mockUserCred = {
    "username": `dhwnai${n}`,
    "password": `fb@dhwani`,
  };
  return instance;
}

module.exports = {
  setupStrapi
};