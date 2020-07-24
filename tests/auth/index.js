const request = require('supertest');
function getMockData(mockUserCred) {
  return {
    "username": mockUserCred.username,
    "password": mockUserCred.password,
    "email": `${mockUserCred.username}@dhwaniris.com`,
    "organisation": {
      "organisation_registration_type": "1",
      "name": "Dhwani",
      "short_name": "DRIS",
      "legal_name": "Dhwani Rural Information System"
    }
  }
}
// user mock data
describe("Module: Auth", () => {
  it('Register: should register user with organisation and return jwt token, account, organisation', async done => {
    let mockData = getMockData(strapi.mockUserCred);
    await request(strapi.server) // app server is an instance of Class: http.Server
      .post('/auth/local/register')
      .set('accept', 'application/json')
      .set('Content-Type', 'application/json')
      .send(mockData)
      .expect('Content-Type', /json/)
      .expect(200)
      .then(data => {
        strapi.mockUserCred.jwt = data.body.jwt;
        expect(data.body.jwt).toBeDefined();
        expect(data.body.user).toBeDefined();
        expect(data.body.user.account).toBeDefined();
        expect(data.body.user.role).toBeDefined();
        expect(data.body.user.organisation).toBeDefined();
        expect(data.body.user.organisation.workspace).toBeDefined();
        done();
      }).catch(err => {
        done(err);
      });
  })
  it('Login: should register user with organisation and return jwt token, account, organisation', async done => {
    let mockData = getMockData(strapi.mockUserCred);
    await request(strapi.server) // app server is an instance of Class: http.Server
      .post('/auth/local')
      .set('accept', 'application/json')
      .set('Content-Type', 'application/json')
      .send({
        identifier: mockData.username,
        password: mockData.password
      })
      .expect('Content-Type', /json/)
      .expect(200)
      .then(data => {
        expect(data.body.jwt).toBeDefined();
        expect(data.body.user).toBeDefined();
        expect(data.body.user.account).toBeDefined();
        expect(data.body.user.role).toBeDefined();
        done();
      }).catch(err => {
        done(err);
      });
  })
})

