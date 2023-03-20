import  Express  from "express";
import createHttpError from "http-errors"
import multer from "multer"
import { v2 as cloudinary } from "cloudinary"
import { CloudinaryStorage } from "multer-storage-cloudinary"
import PostModel from "../posts/model.js";

const PostsFileRouter=Express.Router()

const cloudinaryUploader = multer({
    storage: new CloudinaryStorage({
      cloudinary, 
      params: {
        folder: "fs0522/posts",
      },
    }),
  }).single("post")

  PostsFileRouter.post("/posts/:postId/image", cloudinaryUploader,async(req,res,next)=>{

    try{
        const Post=await PostModel.findById(req.params.postId)


      if(Post){
     Post.image=req.file.path
    
     Post.save()
         res.send({message:"file Uploaded"})
      }else{

        res.status(400)
      }
    }catch(err){
       
     next(err)
    }
  })

  export default PostsFileRouter