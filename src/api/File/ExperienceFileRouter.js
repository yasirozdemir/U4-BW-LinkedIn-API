import Express from "express";
import ExperienceModel from "../experiences/model.js";
import UsersModel from "../users/model.js";
import { isUserExisted } from "../experiences/index.js";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import createHttpError from "http-errors";
import { createObjectCsvWriter } from "csv-writer";
import { pipeline } from "stream";
import { Transform } from "@json2csv/node";

const ExperienceFilesRouter = Express.Router();

const cloudinaryUploader = multer({
  storage: new CloudinaryStorage({
    cloudinary,
    params: {
      folder: "fs0522/experiences",
    },
  }),
}).single("image");

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
      const user = await UsersModel.getUserWithExperiencesDetails(
        req.params.userId
      );
      if (user) {
        const experiences = user.experiences;
        const filename = `${(
          user.name +
          "-" +
          user.surname
        ).toLowerCase()}-experiences.csv`;
        const src = JSON.stringify(experiences);
        const transform = new Transform({
          fields: ["area", "role", "company", "description"],
        });
        res.setHeader(
          "Content-Disposition",
          `attachment; filename=${filename}`
        );
        pipeline(src, transform, res, (error) => {
          if (error) console.log(error);
        });
      }
    } catch (error) {
      next(error);
    }
  }
);

// ExperienceFilesRouter.get(
//   "/users/:userId/experiences/csv/download",
//   isUserExisted,
//   async (req, res, next) => {
//     try {
//       const user = await UsersModel.getUserWithExperiencesDetails(
//         req.params.userId
//       );
//       if (user) {
//         const experiences = user.experiences;
//         const filename = `${(
//           user.name +
//           "-" +
//           user.surname
//         ).toLowerCase()}-experiences.csv`;
//         const csvOptions = {
//           path: filename,
//           header: [
//             { id: "area", title: "Area" },
//             { id: "role", title: "Role" },
//             { id: "company", title: "Company" },
//             { id: "description", title: "Description" },
//           ],
//         };
//         const csvWriter = createObjectCsvWriter(csvOptions);
//         res.setHeader(
//           "Content-Disposition",
//           `attachment; filename=${filename}`
//         );
//         await csvWriter.writeRecords(experiences);
//         res.sendFile(filename, { root: process.cwd() }, (err) => {
//           console.log(err);
//         });
//       } else {
//         next(
//           createHttpError(404, `User with id ${req.params.userId} not found!`)
//         );
//       }
//     } catch (error) {
//       next(error);
//     }
//   }
// );

export default ExperienceFilesRouter;
