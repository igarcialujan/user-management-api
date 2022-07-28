require('dotenv').config()
import { expect } from 'chai'
import { createUser, authenticateUser, getUser, updateUser, deleteUser } from '../src/api/services/users.service'
import mongoose, { connect, disconnect } from 'mongoose'
const { Types: { ObjectId } } = mongoose
import { deleteMany, findOne, create, findById } from '../src/api/models/User'
import { ConflictError, CredentialsError, NotFoundError } from '../src/api/errors'
import { compareSync, hashSync } from 'bcryptjs'

const { env: { MONGO_URI } } = process

describe('createUser', () => {
    before(() => connect(MONGO_URI))

    beforeEach(() => deleteMany())

    it('should suceed with new user', async () => {
        const name = 'Wendy Pan'
        const username = 'wendy'
        const email = 'wendypan@gmail.com'
        const password = '123123123'

        const res = await createUser(name, username, email, password)
            
        expect(res).to.be.undefined

        const user = await findOne({ email })
     
        expect(user).to.exist
        expect(user.email).to.equal(email)
        expect(compareSync(password, user.password)).to.be.true      
    })

    describe('when user already exists', () => {
        let user 

        beforeEach(() => {
            user = {
                name: 'Wendy Pan',
                username: 'wendy',
                email: 'wendypan@gmail.com',
                password: '123123123'
            }

            return create(user) 
        })

        it('should fail when user already exists', async () => {
            const { name, username, email, password } = user

            try {
                await createUser(name, username, email, password)

                throw new Error('should not reach this point')
            } catch(error) {
                expect(error).to.exist
                expect(error).to.be.instanceOf(ConflictError) 
                expect(error.message).to.equal('user with this username or email already exists')
            }
        })
    })
    
    after(async () => {
        await deleteMany()
        
        await disconnect()
    })
})


describe('authenticateUser', () => {
    before(() => connect(MONGO_URI))

    beforeEach(() => deleteMany())
    
    let user, userId

    beforeEach(async () => {
        user = {
            name: 'Wendy Pan',
            username: 'wendypan',
            email: 'wendypan@gmail.com',
            password: '123123123'
        }

        const user2 = await create({ ...user, password: hashSync(user.password) })
        
        userId = user2.id
    })

    it('should suceed with correct credentials for an already existing user', async () => {
        const { username, password } = user 

        const id = await authenticateUser(username, password)

        expect(id).to.exist
        expect(id).to.equal(userId)
    })

    it('should fail with incorrect password', async () => {
        const { username, password } = user

        try {
            await authenticateUser(username, password + '-wrong')
            
            throw new Error('should not reach this point')
        } catch (error) {
            expect(error).to.exist
            expect(error).to.be.instanceOf(CredentialsError)
            expect(error.message).to.equal('wrong credentials')
        }
    })

    it('should fail with incorrect username', async () => {
        const { username, password } = user

        try {
            await authenticateUser(username + '-wrong', password)
            
            throw new Error('should not reach this point')
        } catch (error) {
            expect(error).to.exist
            expect(error).to.be.instanceOf(CredentialsError)
            expect(error.message).to.equal('wrong credentials')
        }
    })

    it('should fail with incorrect password', async () => {
        const { username, password } = user

        try {
            await authenticateUser(username, password + '-wrong')
            
            throw new Error('should not reach this point')
        } catch (error) {
            expect(error).to.exist
            expect(error).to.be.instanceOf(CredentialsError)
            expect(error.message).to.equal('wrong credentials')
        }
    })

    after(async () => {
        await deleteMany()

        await disconnect()
    })      
})


describe('getUser', () => {
    before(() => connect(MONGO_URI))

    beforeEach(() => deleteMany())

    let user, userId 

    beforeEach(async () => {
        user = {
            name: 'Wendy Pan',
            username: 'wendypan',
            email: 'wendypan@gmail.com',
            password: '123123123'
        }

        const user2 = await create(user)
        
        userId = user2.id
    })

    it('should suceed with correct id for an already existing user', async () => { 
        const { name, username, email } = user 

        const user2 = await getUser(userId)
            
        expect(user2).to.exist
        expect(user2.name).to.equal(name)
        expect(user2.username).to.equal(username)
        expect(user2.email).to.equal(email)
        expect(user2.password).to.not.exist
    })

    it('should fail with incorrect id', async () => {
        userId = new ObjectId().toString()

        try {
            await getUser(userId)
            
            throw new Error('should not reach this point')
        } catch (error) {
            expect(error).to.exist
            expect(error).to.be.instanceOf(NotFoundError)
            expect(error.message).to.equal(`user with id ${userId} not found`)
        }
    })

    after(async () => {
        await deleteMany()
        
        await disconnect()
    })
})


describe('updateUser', () => {
    before(() => connect(MONGO_URI))

    beforeEach(() => deleteMany())
 
    let user, userId

    beforeEach(async () => {
        user = {
            name: 'Wendy Pan',
            username: 'wendypan',
            email: 'wendypan@gmail.com',
            password: '123123123',
            favs: []
        }

        const user2 = await create({ ...user, password: hashSync(user.password) })
        
        userId = user2.id
    })

    it('should succeed with existing id and correct password', async () => {
        let { name, username, password } = user 

        const newName = name + '-updated'
        const newUsername = username + '-updated'
        const newEmail = 'wendy.pan@gmail.com'
        const newPassword = password + '-updated'

        const data = { newName, newUsername, newEmail, password, newPassword }

        const res = await updateUser(userId, data)

        expect(res).to.be.undefined
    
        const user2 = await findById(userId)   

        expect(user2.name).to.equal(newName)
        expect(user2.username).to.equal(newUsername)
        expect(user2.email).to.equal(newEmail)
        expect(compareSync(newPassword, user2.password)).to.be.true
    })

    it('should succeed with existing id and correct favs', async () => {
        const favs = ['12345XFD']

        const data = { favs }

        const res = await updateUser(userId, data)

        expect(res).to.be.undefined
    
        const user2 = await findById(userId)   

        expect(user2.favs[0]).to.equal(favs[0])
    })

    it('should fail with non-existing id', async () => {
        const { username, password } = user

        const userId = ObjectId().toString()
        const newUsername = username + '-updated'

        try {
            await updateUser(userId, { newUsername, password })
            
            throw new Error('should not reach this point')
        } catch (error) {
            expect(error).to.exist
            expect(error).to.be.instanceOf(NotFoundError)
            expect(error.message).to.equal(`user with id ${userId} not found`)
        }
    })

    it('should fail with incorrect password', async () => {
        let { username, password } = user

        password += '-wrong'
        const newUsername = username + '-updated'

        const data = { newUsername, password }

        try {
            await updateUser(userId, data)
            
            throw new Error('should not reach this point')
        } catch (error) {
            expect(error).to.exist
            expect(error).to.be.instanceOf(CredentialsError)
            expect(error.message).to.equal('wrong password')
        }
    })

    it('should fail when trying to update the username to another that already exists', async () => {
        const user2 = {
            name: 'Peter Pan',
            username: 'peterpan',
            email: 'peterpan@gmail.com',
            password: '123123123'
        }

        const newUsername = 'peterpan'
        
        const { password } = user

        try {
            await create(user2)
                
            await updateUser(userId, { newUsername, password })
            
            throw new Error('should not reach this point')
        } catch (error) {
            expect(error).to.exist
            expect(error).to.be.instanceOf(ConflictError)
            expect(error.message).to.equal('user with that username or email already exists')
        }
    })

    after(async () => {
        await deleteMany()

        await disconnect()
    })
})


describe('deleteUser', () => {
    before(() => connect(MONGO_URI))

    beforeEach(() => deleteMany())
 
    let user, userId

    beforeEach(async () => {
        user = {
            name: 'Wendy Pan',
            username: 'wendypan',
            email: 'wendypan@gmail.com',
            password: '123123123'
        }

        const user2 = await create({ ...user, password: hashSync(user.password) })
        
        userId = user2.id
    })

    it('should suceed with existing id and correct password', async () => {
        let { password } = user 
        
        const res = await deleteUser(userId, password)

        expect(res).to.be.undefined
    
        const user2 = await findById(userId)   

        expect(user2).to.be.null
    })

    it('should fail with non-existing id', async () => { 
        const { password } = user

        const userId = ObjectId().toString()

        try {
            await deleteUser(userId, password)
            
            throw new Error('should not reach this point')
        } catch (error) {
            expect(error).to.exist
            expect(error).to.be.instanceOf(CredentialsError)
            expect(error.message).to.equal('wrong credentials')
        }
    })

    it('should fail with incorrect password', async () => {
        let { password } = user

        password += '-wrong'

        try {
            await deleteUser(userId, password)
            
            throw new Error('should not reach this point')
        } catch (error) {
            expect(error).to.exist
            expect(error).to.be.instanceOf(CredentialsError)
            expect(error.message).to.equal('wrong credentials')
        }
    })

    after(async () => {
        await deleteMany()

        await disconnect()
    })
})