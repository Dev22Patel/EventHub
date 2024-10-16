const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    events: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Event'
        }
    ],
    participatedAuctions: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Auction'
        }
    ],
},{timestamps:true});


userSchema.pre('save',async function(next){
    const user = this;
    if(!user.isModified("password")){
        next();
    }
    try {
        const saltRound = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(user.password, saltRound);
        user.password = hashedPassword;
    } catch (error) {
        next(error);
    }
});

userSchema.methods.generateToken = function () {
    try {
        return jwt.sign({
            userId : this._id.toString(),
            email:this.email,
        },
        process.env.JWT_SECRET_KEY,
        {
            expiresIn: "1d",
        }
    );
    }  catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
    }

}

const User = mongoose.model('User',userSchema);

module.exports = User;
