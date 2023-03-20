import Express from "express";
import listEndpoints from "express-list-endpoints";
import { badRequestHandler, genericErrorHandler, notFoundHandler } from "./ErrorHandlers.js";
import mongoose from "mongoose"
import cors from 'cors';

const server=Express()
const port=process.env.PORT  
server.use(Express.json())




const whiteList=[process.env.FE_DEV_URL, process.env.FE_PROD_URL]

const corsOpt={
    origin: (currentOrigin, corsNext) => {
      if (!currentOrigin || whiteList.indexOf(currentOrigin) !== -1) {
       
        corsNext(null, true)
      } else {
   
        corsNext(createHttpError(400, `Origin ${currentOrigin} is not in the whitelist!`))
      }
    },
  }

  server.use(
    cors(corsOpt)
  )





 server.use(badRequestHandler)

server.use(notFoundHandler)
server.use(genericErrorHandler)




mongoose.connect(process.env.MONGO_URL)
mongoose.connection.on("connected",()=>{
    console.log("succesfully connected to mongo")
})

server.listen(port,()=>{
    // console.table(listEndpoints(server))
    console.log(process.env.FE_DEV_URL)
    console.log(`Server is listening on port ${port}`)
})
