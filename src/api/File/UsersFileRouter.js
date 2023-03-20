import  Express  from "express";
import createHttpError from "http-errors"
import UsersModel from "../users/model.js"
import multer from "multer"
import { v2 as cloudinary } from "cloudinary"
import { CloudinaryStorage } from "multer-storage-cloudinary"

const UsersFileRouter=Express.Router()

const cloudinaryUploader = multer({
    storage: new CloudinaryStorage({
      cloudinary,
      params: {
        folder: "fs0522/users",
      },
    }),
  }).single("image")

  UsersFileRouter.post("/users/:userId/image", cloudinaryUploader,async(req,res,next)=>{

    try{
        const User=await UsersModel.findById(req.params.userId)


      if(User){
     User.image=req.file.path
  
     User.save()
         res.send({message:"file Uploaded"})
      }else{

        res.status(400)
      }
    }catch(err){
       
     next(err)
    }
  })


  export default UsersFileRouter