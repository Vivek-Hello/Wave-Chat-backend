import mongoose from "mongoose";


const UserSchema =  new mongoose.Schema({
 userName:{
    type:String,
    required:true
 },
 email:{
    type:String,
    required:true
 },
 password:{
    type:String,
    required:true
 },   
 image:{
    type:String,
    default:"https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg"
 },
},{timestamps:true})

export const User =  mongoose.model("User",UserSchema);