const request = require('supertest');
// user mock data
function randomNum() {
  return Math.floor((Math.random() * 100000) + 1);
}
beforeAll(async done => {
  let params = {
      reg_type: 'test_type' + randomNum()
  }
  const ogt = await strapi.query('organisation-registration-type').create(params);
  done();
});
describe("Module: Organisation Registration Type", () => {
  it('List: should return list', async done => {
    await request(strapi.server) // app server is an instance of Class: http.Server
      .get('/organisation-registration-types')
      .set('Authorization', `Bearer ${strapi.mockUserCred.jwt}`)
      .expect(200)
      .then(data => {
        // expect(data.body).toBeArray();
        // expect(data.body.user).toBeDefined();
        // expect(data.body.user.account).toBeDefined();
        // expect(data.body.user.role).toBeDefined();
        // expect(data.body.user.organisation).toBeDefined();
        done();
      }).catch(err => {
        done(err);
      });
  })
})
