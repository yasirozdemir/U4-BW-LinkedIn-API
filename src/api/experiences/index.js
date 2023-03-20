import Express from "express";
import createHttpError from "http-errors";
import ExperienceModel from "./model.js";
import UsersModel from "../users/model.js";

const ExperiencesRouter = Express.Router();

const isUserExisted = async (req, res, next) => {
  const user = await UsersModel.findById(req.params.userId);
  if (user) next();
  else
    next(createHttpError(404, `User with id ${req.params.userId} not found!`));
};

// create experince, post in into dedicated collection ✅, push it's object id into related user! ✅
ExperiencesRouter.post(
  "/users/:userId/experiences",
  isUserExisted,
  async (req, res, next) => {
    try {
      const newExp = new ExperienceModel({
        userId: req.params.userId,
        ...req.body,
      });
      const { _id } = await newExp.save();
      const user = await UsersModel.findByIdAndUpdate(
        req.params.userId,
        { $push: { experiences: _id } },
        { new: true, runValidators: true }
      );
      res.status(201).send({
        id: _id,
        message: "Experience created successfully!",
      });
    } catch (error) {
      next(error);
    }
  }
);

ExperiencesRouter.get(
  "/users/:userId/experiences",
  isUserExisted,
  async (req, res, next) => {
    try {
      const experiences = await ExperienceModel.find();
      res.send(experiences);
    } catch (error) {
      next(error);
    }
  }
);

ExperiencesRouter.get(
  "/users/:userId/experiences/:expId",
  isUserExisted,
  async (req, res, next) => {
    try {
      const experince = await ExperienceModel.findById(req.params.expId);
      if (experince) res.send(experince);
      else
        next(
          createHttpError(
            404,
            `Experience with id ${req.params.expId} not found!`
          )
        );
    } catch (error) {
      next(error);
    }
  }
);

ExperiencesRouter.put(
  "/users/:userId/experiences/:expId",
  isUserExisted,
  async (req, res, next) => {
    try {
      res.send();
    } catch (error) {
      next(error);
    }
  }
);

// delete experince from the dedicated collection, and remove its object Id from related user's experiences array
ExperiencesRouter.delete(
  "/users/:userId/experiences/:expId",
  isUserExisted,
  async (req, res, next) => {
    try {
      const deletedExperience = await ExperienceModel.findByIdAndDelete(
        req.params.expId
      );
      if (deletedExperience) {
        const user = await UsersModel.findByIdAndUpdate(
          req.params.userId,
          { $pull: { experiences: req.params.expId } },
          { new: true, runValidators: true }
        );
        res.status(204).send();
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

export default ExperiencesRouter;
