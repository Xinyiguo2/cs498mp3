// Load required packages
var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');
// Define our user schema
var UserSchema = new mongoose.Schema({
    name: {type : String, required : 'Name can not be blank! '},
    email: {type: String, required : 'Email can not be blank',unique : true},
    pendingTasks: [{type : String, ref: 'Task'}],
    dateCreated: Date
});
UserSchema.plugin(uniqueValidator,{message: "is already exists"})

// Export the Mongoose model
module.exports = mongoose.model('User', UserSchema);
