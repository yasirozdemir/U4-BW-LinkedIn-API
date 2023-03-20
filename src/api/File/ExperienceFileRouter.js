import Express from "express";
import ExperienceModel from "../experiences/model.js";
import UsersModel from "../users/model.js";
import { isUserExisted } from "../experiences/index.js";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { pipeline } from "stream";
import { Transform } from "@json2csv/node";
import fs from "fs-extra"
const ExperienceFilesRouter = Express.Router();

const cloudinaryUploader = multer({
  storage: new CloudinaryStorage({
    cloudinary,
    params: {
      folder: "fs0522/experiences",
    },
  }),
}).single("image");
const {  createReadStream } = fs
const getJSONReadableStream = () => createReadStream()
// upload image to cloudinary ✅, update the related experiences image path using the url from cloudinary ✅
ExperienceFilesRouter.post(
  "/users/:userId/experiences/:expId/image",
  isUserExisted,
  cloudinaryUploader,
  async (req, res, next) => {
    try {
      const experience = await ExperienceModel.findByIdAndUpdate(
        req.params.expId,
        {
          $set: {
            image: req.file.path,
          },
        },
        { new: true, runValidators: true }
      );
      if (experience) {
        res.status(201).send({
          message: `Image successfully added to experience with id ${req.params.expId}`,
          imageURL: req.file.path,
          id: req.params.expId,
        });
      } else {
        next(
          createHttpError(
            404,
            `Experience with id ${req.params.expId} not found!`
          )
        );
      }
    } catch (error) {
      next(error);
    }
  }
);

ExperienceFilesRouter.get(
  "/users/:userId/experiences/csv/download",
  isUserExisted,
  async (req, res, next) => {
    try {
    const User=await UsersModel.findById(req.params.userId)
     res.setHeader("Content-Disposition", "attachment; filename=Experiences.csv")
     const source = getJSONReadableStream(User.experiences)
     const transform = new Transform({ fields: [
      "role", "company", "startDate","endDate","area","description"
    ] })
     const destination = res
     pipeline(source, transform, destination, err => {
       if (err) console.log(err)
     })
    } catch (error) {
      next(error);
    }
  }
);

export default ExperienceFilesRouter;
