const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    fullname: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    route: {
        type: String,
        required: true
    },
    profilepdf:{
        type:String,
        required:true,
        default:""
    },
    profilepic:{
        type:String,
        required:true,
        default:""
    },
    isVerfied:{
        type:Boolean,
        default:false
    },
    scanCount:{
        type:Number,
        default:2
    },

});

// Export the model
const User = mongoose.model("User", userSchema);
module.exports = User;