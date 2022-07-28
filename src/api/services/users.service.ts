import { ConflictError, CredentialsError, NotFoundError } from '../errors'
import User from '../models/User'
import { hashSync, compareSync } from 'bcryptjs'
import sanitizeDocument from '../utils/sanitizers'

export const createUser = async (name: string, username: string, email: string, password: string) => {
    try {
        await User.create({ name, username, email, password: hashSync(password) })
    } catch (error) {
        if (error.code === 11000)
            throw new ConflictError('user with this username or email already exists')
    
        throw error   
    }
}

export const authenticateUser = async (username: string, password: string) => {
    try {
        const user = await User.findOne({ username })
        
        if (!user || !compareSync(password, user.password)) throw new CredentialsError('wrong credentials')

        sanitizeDocument(user)
        
        return user.id
    } catch(error) {
        throw error
    }
}

export const getUser = async (id: string) => {
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

export const updateUser = async (id: string, data) => {
    try {
        const user = await User.findById(id)
        
        if (!user) throw new NotFoundError(`user with id ${id} not found`)
        
        let { password } = data 
    
        if (password && !compareSync(password, user.password)) throw new CredentialsError('wrong password')

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
                user[key] = hashSync(data[key])
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

export const deleteUser = async (id: string, password: string) => {
    try {
        const user = await User.findById(id)
        
        if (!user || !compareSync(password, user.password)) 
            throw new CredentialsError('wrong credentials')
    
        await user.remove()      
    } catch (error) {
        throw error
    }
}






