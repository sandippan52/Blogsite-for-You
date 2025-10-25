import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
    userName : {type: String, required: true, unique : true},
    email : {type: String, required: true, unique: true},
    password : {type : String, required : true}
})

export const User = mongoose.model("User", UserSchema);