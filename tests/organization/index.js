const request = require('supertest');
function randomNum() {
    return Math.floor((Math.random() * 100000) + 1);
}

function getMockData() {
    let n = randomNum();
    return {
        "organisation_registration_type": "1",
        "name": `dhwnai${n}`,
        "short_name": `DRIS-${n}`,
        "legal_name": `Dhwani-${n} Rural Information System`
    }
}

let organisation_id = '';

describe("Module: Organization", () => {
    it('Create: create organization and return account, organization', async done => {
        let mockData = getMockData();

        await request(strapi.server) // app server is an instance of Class: http.Server
            .post('/organizations')
            .set('Authorization', `Bearer ${strapi.mockUserCred.jwt}`)
            .send(mockData)
            .expect(200)
            .then(data => {
                organisation_id = data.body.id;
                expect(data.body).toBeDefined();
                expect(data.body.account).toBeDefined();
                expect(data.body.organisation_registration_type).toBeDefined();
                done();
            }).catch(err => {
                done(err);
            });
    })

    it("Update : update organization and return account , organization", async done => {
        let mockData = getMockData();
        await request(strapi.server) // app server is an instance of Class: http.Server
            .put('/organizations/' + organisation_id)
            .set('Authorization', `Bearer ${strapi.mockUserCred.jwt}`)
            .send(mockData)
            .expect(200)
            .then(data => {
                expect(data.body).toBeDefined();
                expect(data.body.account).toBeDefined();
                expect(data.body.organisation_registration_type).toBeDefined();
                done();
            }).catch(err => {
                done(err);
            });
    })
})

