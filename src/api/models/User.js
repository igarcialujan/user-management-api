const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        validate: [
            {
                validator(name) {
                    return name.trim() === name
                },
                message: 'name should not have white spaces around'
            }
        ]
    },
    username: {
        type: String,
        required: true,
        unique: true,
        validate: [
            {
                validator(username) {
                    return username.length > 3
                },
                message: 'username should have at least 4 characters'
            },
            {
                validator(username) {
                    return !username.includes(' ')
                },
                message: 'username should not have white spaces'
            }
        ]
    },
    email: {
        type: String,
        required: true,
        unique: true,
        validate: {
            validator(email) { 
                return String(email)
                    .toLowerCase()
                    .match(/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/)
            },
            message: 'Please enter a valid email address'
        }
    },
    password: {
        type: String,
        required: true,
        validate: [
            {
                validator(password) {
                    return password.length > 7
                },
                message: 'password should have at least 8 characters'
            },
            {
                validator(password) {
                    return !password.includes(' ')
                },
                message: 'password should not have white spaces'
            }
        ]
    },
    favs: {
        type: Array
    }
})

module.exports = mongoose.model('User', userSchema)