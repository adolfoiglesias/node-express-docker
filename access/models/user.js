const mongoose = require('mongoose');

const UsersSchema = mongoose.Schema({
   
    email: {
        type: String,
        required: true,
        trim: true, 
        unique: true
    },
    password: {
        type: String,
        required: true,
        trim: true
    },
    createdAt: {
        type: Date,
        default: Date.now()
    },
    roles:[{
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Role'
    }]
});

module.exports = mongoose.model('User', UsersSchema);