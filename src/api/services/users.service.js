const { ConflictError, CredentialsError, NotFoundError } = require('../errors')
const User = require('../models/User')
const bcrypt = require('bcryptjs')
const { sanitizeDocument } = require( './helpers/sanitizers' )

const createUser = async (name, username, email, password) => {
    try {
        await User.create({ name, username, email, password: bcrypt.hashSync(password) })
    } catch (error) {
        if (error.code === 11000)
            throw new ConflictError('user with this username or email already exists')
    
        throw error   
    }
}

const authenticateUser = async (username, password) => {
    try {
        const user = await User.findOne({ username })
        
        if (!user || !bcrypt.compareSync(password, user.password)) throw new CredentialsError('wrong credentials')

        sanitizeDocument(user)
        
        return user.id
    } catch(error) {
        throw error
    }
}

const getUser = async (id) => {
    try {
        const user = await User.findById(id).lean()
        
        if (!user) throw new NotFoundError(`user with id ${id} not found`)

        sanitizeDocument(user)

        delete user.password

        return user
    } catch(error) {
        throw error
    }
}

const updateUser = async (id, data) => {
    try {
        const user = await User.findById(id)
        
        if (!user) throw new NotFoundError(`user with id ${id} not found`)
        
        let { password } = data 
    
        if (password && !bcrypt.compareSync(password, user.password)) throw new CredentialsError('wrong password')

        if (data.newName) {
            data.name = data.newName 

            delete data.newName 
        }

        if (data.newUsername) {
            data.username = data.newUsername 

            delete data.newUsername 
        }

        if (data.newEmail) {
            data.email = data.newEmail 

            delete data.newEmail 
        }
        
        if (data.newPassword) {
            data.password = data.newPassword 

            delete data.newPassword 
        }

        for (const key in data) {
            if (key === 'password')
                user[key] = bcrypt.hashSync(data[key])
            else
                user[key] = data[key]        
        }
    
        await user.save()
    } catch (error) {
        if (error.code === 11000)
            throw new ConflictError('user with that username or email already exists')
        
        throw error
    }
}

const deleteUser = async (id, password) => {
    try {
        const user = await User.findById(id)
        
        if (!user || !bcrypt.compareSync(password, user.password)) 
            throw new CredentialsError('wrong credentials')
    
        await user.remove()      
    } catch (error) {
        throw error
    }
}

module.exports = {
    createUser,
    authenticateUser,
    getUser,
    updateUser,
    deleteUser
}





