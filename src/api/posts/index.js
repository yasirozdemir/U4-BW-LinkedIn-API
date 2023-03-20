import  Express  from "express";
import createHttpError from "http-errors"
import PostModel from "../../validation/PostModel.js";
import q2m from "query-to-mongo"
const PostsRouter=Express.Router()


PostsRouter.post("/posts", async (req,res,next)=>{
    try{  
        const newPost=new PostModel(req.body)
       
        const {_id}=await newPost.save()
        res.status(201).send({_id:_id})
     
    }catch(err){
        next(err)
    }
})

PostsRouter.get("/posts", async (req,res,next)=>{
    try{
        const mongoQuery = q2m(req.query)
        const allPosts=   await PostModel.find(mongoQuery.criteria, mongoQuery.options.fields)
        .limit(mongoQuery.options.limit)
      .skip(mongoQuery.options.skip)
      .sort(mongoQuery.options.sort)
      .populate({path:"user",select:"email name surname"})
      const total = await PostModel.countDocuments(mongoQuery.criteria)

      res.send({
        links: mongoQuery.links("http://localhost:3001/api/posts/", total),
        total,
        numberOfPages: Math.ceil(total / mongoQuery.options.limit),
        allPosts,
      })
    }catch(err){
        next(err)
    }
})


PostsRouter.get("/posts/:postId", async (req,res,next)=>{
    try{
        const Posts=await PostModel.findById(req.params.postId)
        if(Posts){

        
        res.send(Posts)
        }else{
            if(updated){
                res.send(updated)
            }else{
                next(createHttpError(404, `Post with id ${req.params.postId} not found!`))
            
            }
        }
    }catch(err){
        next(err)
    }
})

PostsRouter.put("/posts/:postId", async (req,res,next)=>{
    try{
        let updated=await PostModel.findByIdAndUpdate(
            req.params.postId,
            req.body,
            {new:true,runValidators:true}
        
        )
        if(updated){
            res.send(updated)
        }else{
            next(createHttpError(404, `Post with id ${req.params.postId} not found!`))
        
        }
    }catch(err){
        next(err)
    }
})

PostsRouter.delete("/posts/:postId", async (req,res,next)=>{
    try{
        const deleted= await PostModel.findByIdAndDelete(req.params.postId)
        if(deleted){
            res.status(204).send()
        }
    }catch(err){
        next(err)
    }
})


export default PostsRouter