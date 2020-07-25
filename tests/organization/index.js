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

describe("Module: Organisation", () => {
    it('Create: create organisation and return account, organisation', async done => {
        let mockData = getMockData();

        await request(strapi.server) // app server is an instance of Class: http.Server
            .post('/organisations')
            .set('Authorization', `Bearer ${strapi.mockUserCred.jwt}`)
            .send(mockData)
            .expect(200)
            .then(data => {
                organisation_id = data.body.organisation.id;
                expect(data.body.organisation).toBeDefined();
                expect(data.body.organisation.account).toBeDefined();
                done();
            }).catch(err => {
                done(err);
            });
    })

    it("Update : update organisation and return account , organisation", async done => {
        let mockData = getMockData();
        await request(strapi.server) // app server is an instance of Class: http.Server
            .put('/organisations/' + organisation_id )
            .set('Authorization', `Bearer ${strapi.mockUserCred.jwt}`)
            .send(mockData)
            .expect(200)
            .then(data => {
                expect(data.body.organisation).toBeDefined();
                expect(data.body.organisation.account).toBeDefined();
                done();
            }).catch(err => {
                done(err);
            });
    })
})

