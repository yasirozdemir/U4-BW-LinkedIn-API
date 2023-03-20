import mongoose, { model, Types } from "mongoose"

const {Schema}=mongoose


const commentSchema=new Schema({
    user:{type:mongoose.Types.ObjectId,required:true, ref:"User"},
    comment:{type:String, required:true,minLength: 5, maxLength:20},
    post:{type:mongoose.Types.ObjectId,required:true, ref:"Post"},
},{timeStamps:true})


export default model("Comment",commentSchema)