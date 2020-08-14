const mongoose = require('mongoose');

const UsersSchema = mongoose.Schema({
   
    name: {
        type: String,
        required: true,
        trim: true, 
        unique: true
    }
});

module.exports = mongoose.model('Role', UsersSchema);