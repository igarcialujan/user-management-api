import app from '../../src/app';
import supertest from 'supertest';
import { expect } from 'chai';
import shortid from 'shortid';
import mongoose from 'mongoose';

let userId = '';
const userBody = {
    email: `peter.pan${shortid.generate()}@gmail.com`,
    password: '123123123',
};

let accessToken = '';
let refreshToken = '';
const newFirstName = 'Wendy';
const newFirstName2 = 'Mickey';
const newLastName2 = 'Mouse';

describe('/api/users and /api/auth', function () {
    let request: supertest.SuperAgentTest;

    before(function () {
        request = supertest.agent(app);
    });

    describe('POST /users', () => {
        it('should add a new user', async function () {
            const res = await request.post('/users').send(userBody);
    
            expect(res.status).to.equal(201);
            expect(res.body).not.to.be.empty;
            expect(res.body).to.be.an('object');
            expect(res.body.id).to.be.a('string');

            userId = res.body.id;
        });
    })

    describe('POST /auth', () => {
        it('should authenticate an existing user with valid email and password', async function () {
            const res = await request.post('/auth').send(userBody);
    
            expect(res.status).to.equal(201);
            expect(res.body).not.to.be.empty;
            expect(res.body).to.be.an('object');
            expect(res.body.accessToken).to.be.a('string');
    
            accessToken = res.body.accessToken;
            refreshToken = res.body.refreshToken;
        });
    })


    describe('GET /users/:userId', () => {
        it('should retrieve a user with an access token', async function () {
            const res = await request
                .get(`/users/${userId}`)
                .set({ Authorization: `Bearer ${accessToken}` })
                .send();

            expect(res.status).to.equal(200);
            expect(res.body).not.to.be.empty;
            expect(res.body).to.be.an('object');
            expect(res.body._id).to.be.a('string');
            expect(res.body._id).to.equal(userId);
            expect(res.body.email).to.equal(userBody.email);
        });
    })

    describe('GET /users', () => {
        it('should not allow a user to get all users', async function () {
            const res = await request
                .get(`/users`)
                .set({ Authorization: `Bearer ${accessToken}` })
                .send();

            expect(res.status).to.equal(403);
        });
    });

    describe('PATCH /users/:userId', () => {
        it('should not allow a partial update to user', async function () {
            const res = await request
                .patch(`/users/${userId}`)
                .set({ Authorization: `Bearer ${accessToken}` })
                .send({
                    firstName: newFirstName,
                });
    
            expect(res.status).to.equal(403);
        });
    });

    describe('PUT /users/:userId', () => {
        it('should not allow to update user with an nonexistent ID', async function () {
            const res = await request
                .put(`/users/id-doesnt-exist`)
                .set({ Authorization: `Bearer ${accessToken}` })
                .send({
                    email: userBody.email,
                    password: userBody.password,
                    firstName: 'Peter',
                    lastName: 'Pan',
                    permissionFlags: 256,
                });

            expect(res.status).to.equal(404);
        });

        it('should not allow a user to change the permission flags', async function () {
            const res = await request
                .put(`/users/${userId}`)
                .set({ Authorization: `Bearer ${accessToken}` })
                .send({
                    email: userBody.email,
                    password: userBody.password,
                    firstName: 'Peter',
                    lastName: 'Pan',
                    permissionFlags: 256,
                });

            expect(res.status).to.equal(400);
            expect(res.body.errors).to.be.an('array');
            expect(res.body.errors).to.have.length(1);
            expect(res.body.errors[0]).to.equal(
                'User cannot change permission flags'
            );
        });

        it('should allow a PUT to /users/:userId/permissionFlags/2 for testing', async function () {
            const res = await request
                .put(`/users/${userId}/permissionFlags/2`)
                .set({ Authorization: `Bearer ${accessToken}` })
                .send({});

            expect(res.status).to.equal(204);
        });
    });

    describe('POST /auth/refresh-token', function () {
        it('should authenticate a user with permission flags and valid refresh token', async function () {
            const res = await request
                .post('/auth/refresh-token')
                .set({ Authorization: `Bearer ${accessToken}` })
                .send({ refreshToken });

            expect(res.status).to.equal(201);
            expect(res.body).not.to.be.empty;
            expect(res.body).to.be.an('object');
            expect(res.body.accessToken).to.be.a('string');

            accessToken = res.body.accessToken;
            refreshToken = res.body.refreshToken;
        });
    })

    describe('PUT /users/:userId', () => {
        it('should allow a user with permission flags to change first and last names', async function () {
            const res = await request
                .put(`/users/${userId}`)
                .set({ Authorization: `Bearer ${accessToken}` })
                .send({
                    email: userBody.email,
                    password: userBody.password,
                    firstName: newFirstName2,
                    lastName: newLastName2,
                    permissionFlags: 2,
                });
                
            expect(res.status).to.equal(204);
        });
    })

    describe('GET /users/:userId', () => {
        it('should retrieve user and should have a new full name', async function () {
            const res = await request
                .get(`/users/${userId}`)
                .set({ Authorization: `Bearer ${accessToken}` })
                .send();

            expect(res.status).to.equal(200);
            expect(res.body).not.to.be.empty;
            expect(res.body).to.be.an('object');
            expect(res.body._id).to.be.a('string');
            expect(res.body.firstName).to.equal(newFirstName2);
            expect(res.body.lastName).to.equal(newLastName2);
            expect(res.body.email).to.equal(userBody.email);
            expect(res.body._id).to.equal(userId);
        });
    })

    describe('DELETE /users/:userId', () => {
        it('should allow a user to delete his account with valid access token', async function () {
            const res = await request
                .delete(`/users/${userId}`)
                .set({ Authorization: `Bearer ${accessToken}` })
                .send();

            expect(res.status).to.equal(204);
        });
    })

    after(function (done) {
        app.close(() => {
            mongoose.connection.close(done);
        });
    });
});