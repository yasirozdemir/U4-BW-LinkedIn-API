import mongoose, { model, Types } from "mongoose"

const {Schema}=mongoose

const PostsSchema= new Schema({
    text:{type:String,required:true,minLength: 5, maxLength:13 },
    image:{type:String, default:""},
    user:{type:mongoose.Types.ObjectId,required:true, ref:"User"},
    comments:[{type:mongoose.Types.ObjectId,required:true, ref:"Comment"}]
},{timestamps:true})

export default model("Post",PostsSchema)