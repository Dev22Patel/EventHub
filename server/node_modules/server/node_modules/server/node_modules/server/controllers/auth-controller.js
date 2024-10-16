const User = require('../models/user-model')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken'); // Import JWT

const home = async (req,res) => {
    try{
        res
        .status(200)
        .send("Auth page");
    }catch(error){
        console.log(error);
    }
}
const register = async (req,res) => {
    try{
        const {username,email,password} = req.body;
        const UserExist = await User.findOne({email:email});
        if(UserExist){
            return res.status(400).json({message: "User already exist"});
        }

        const UserCreated = await User.create({username,email,password});
        return res.status(201).json({
            message: UserCreated,
            token : await UserCreated.generateToken(),
            userId : UserCreated._id.toString(),
        });

    }catch(error){
        console.log(error);
        return res.status(500).json("internal server error");
    }
}


const login = async (req,res) => {
    try {
        const {email,password} = req.body;
        const UserExist = await User.findOne({email});
        if(!UserExist){
            return res.status(404).json({message: "User not found"});
        }
        const isMatch = await bcrypt.compare(password, UserExist.password);
        if(isMatch){
            return res.status(200).json({
                message: "Logged in successfully",
                token : await UserExist.generateToken(),
                userId : UserExist._id.toString(),
            });
        }else{
            return res.status(400).json({message: "Invalid credentials"});
        }
    } catch (error) {

    }
}




module.exports = {
    home,
    register,
    login,
};
