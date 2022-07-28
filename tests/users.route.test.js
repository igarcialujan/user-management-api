const request = require('supertest')('https://localhost/api/v1')
import { expect } from "chai"

describe("users route test", () => {
    let user

    before(() => {
        user = {
            name: 'Wendy Pan',
            username: 'apitest',
            email: 'wendypan@apitest.org',
            password: '123123123'
        }
    })

    describe("POST /users - registerUser", () => {
        it("should suceed with new user", async () => {
            const response = await request
                .post("/users")
                .send(user)
        
            expect(response.status).to.eql(201)
            expect(response.body.status).toBe('success')
        })
    
        it("should fail when username already exits", async () => {
            const response = await request
                .post("/users")
                .send({
                    name: 'Wendy Pan',
                    username: 'apitest',
                    email: 'wendypan@gmail.com',
                    password: '123123123'
                })
        
            expect(response.status).to.eql(409)
        })
    
        it("should fail when email already exits", async () => {
            const response = await request
                .post("/users")
                .send({
                    name: 'Wendy Pan',
                    username: 'wendypanapitest',
                    email: 'wendypan@apitest.org',
                    password: '123123123'
                })
        
            expect(response.status).to.eql(409)
        })
    })
    
    describe("POST /users/auth - logInUser", () => {
        it("should suceed with correct username and password", async () => {
            const response = await request
                .post("/users/auth")
                .send({
                    username: 'apitest',
                    password: '123123123'
                })
        
            expect(response.status).to.eql(200)
            expect(response.body.status).toBe('success')
            expect(response.body.token).to.be.a('string')
        })
    
        it("should fail with wrong username", async () => {
            const response = await request
                .post("/users/auth")
                .send({
                    username: 'wrongusername',
                    password: '123123123'
                })
        
            expect(response.status).to.eql(401)
        })
    
        it("should fail with wrong password", async () => {
            const response = await request
                .post("/users/auth")
                .send({
                    username: 'apitest',
                    password: '234234234'
                })
        
            expect(response.status).to.eql(401)
        })
    })
    
    describe("GET /users - retrieveUser", () => {
        let authentication

        before(() => {
            authentication = await request
                .post("/users/auth")
                .send({
                    username: 'apitest',
                    password: '123123123'
                })
        })

        it("should suceed with correct token", async () => {
            const response = await request
                .get("/users")
                .set("Authorization", `Bearer token=${authentication.token}`)
        
            expect(response.status).to.eql(200)
            expect(response.body.status).toBe('success')
            response.expect('Content-Type',/json/)
            expect(response.body.name).to.eql(user.name)
            expect(response.body.username).to.eql(user.username)
            expect(response.body.email).to.eql(user.email)
            expect(response.body.favs).to.be.a('array')
            expect(response.body.id).to.be.a('string')
        })
    
        it("should fail without token", async () => {
            const response = await request
                .get("/users")
                .set("Authorization", `Bearer token=`)
        
            expect(response.status).to.eql(400)
            expect(response.body.error).to.eql("authorization is not a string")
        })
    
        it("should fail with incorrect token", async () => {
            const { token } = authentication
            const incorrect_token = [...token].reverse().join("")

            const response = await request
                .get("/users")
                .set("Authorization", `Bearer token=${incorrect_token}`)
        
            expect(response.status).to.eql(401)
        })
    })
    
    
    describe("PATCH /users - updateUserProfile", () => {
        it("should suceed with correct token", async () => {
            const authentication = await request
                .post("/users/auth")
                .send({
                    username: 'apitest',
                    password: '123123123'
                })
    
            const response = await request
                .get("/users")
                .set("Authorization", `Bearer token=${authentication.token}`)
                .send({
                    newUsername: 'apitestnewusername',
                    password: '123123123'
                })
        
            expect(response.status).to.eql(204)
            expect(response.body.status).toBe('success')
            expect(response.body.token).to.be.a('string')
        })
    
        it("should fail with wrong username", async () => {
            const response = await request
                .get("/users")
                .send({
                    username: 'wrongusername',
                    password: '123123123'
                })
        
            expect(response.status).to.eql(401)
        })
    
        it("should fail with wrong password", async () => {
            const response = await request
                .get("/users")
                .send({
                    username: 'apitest',
                    password: '234234234'
                })
        
            expect(response.status).to.eql(401)
        })
    })
    
    
    describe("DELETE /users - unregisterUser", () => {
        it("should suceed with correct token", async () => {
            const authentication = await request
                .post("/users/auth")
                .send({
                    username: 'apitest',
                    password: '123123123'
                })
    
            const response = await request
                .get("/users")
                .set("Authorization", `Bearer token=${authentication.token}`)
                .send({
                    newUsername: 'apitestnewusername',
                    password: '123123123'
                })
        
            expect(response.status).to.eql(204)
            expect(response.body.status).toBe('success')
            expect(response.body.token).to.be.a('string')
        })
    
        it("should fail with wrong username", async () => {
            const response = await request
                .get("/users")
                .send({
                    username: 'wrongusername',
                    password: '123123123'
                })
        
            expect(response.status).to.eql(401)
        })
    
        it("should fail with wrong password", async () => {
            const response = await request
                .get("/users")
                .send({
                    username: 'apitest',
                    password: '234234234'
                })
        
            expect(response.status).to.eql(401)
        })
    })
})