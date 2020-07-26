const fs = require('fs');
const {
  setupStrapi
} = require('./helpers/strapi');
jest.setTimeout(100000);

let mockUserCred;
/** this code is called once before any test is called */
beforeAll(async done => {
    await setupStrapi(); // singleton so it can be called many times
    require('./init')();
    done();
});

// /** this code is called once before all the tested are finished */
afterAll(async done => {
  const dbSettings = strapi.config.get('database.connections.default.settings');

  //delete test database after all tests
  if (dbSettings && dbSettings.filename) {
    const tmpDbFile = `${__dirname}/../${dbSettings.filename}`;
    if (fs.existsSync(tmpDbFile)) {
      fs.unlinkSync(tmpDbFile);
    }
  }
  done();
});

it('strapi is defined', async done => {
  expect(strapi).toBeDefined();
  done();
});

require('./organisation-registration-type');
require('./auth');
require('./organization')
