import Express from "express";
import createHttpError from "http-errors";
import commentSchema from "./model.js";
import postModel from "../posts/model.js";

export const isPostExisted = async (req, res, next) => {
  const user = await postModel.findById(req.params.postId);
  if (user) next();
  else
    next(createHttpError(404, `User with id ${req.params.postId} not found!`));
};

const commentRouter = Express.Router();

commentRouter.post(
  "/posts/:postId/comments",
  isPostExisted,
  async (req, res, next) => {
    try {
      const newComment = new commentSchema({
        post: req.params.postId,
        ...req.body,
      });
      const { _id } = await newComment.save();

      const updatedPost = await postModel.findByIdAndUpdate(
        req.params.postId,
        { $push: { comments: _id } },
        { new: true, runValidators: true }
      );
      res.status(201).send(updatedPost);
    } catch (err) {
      next(err);
    }
  }
);

commentRouter.get(
  "/posts/:postId/comments",
  isPostExisted,
  async (req, res, next) => {
    try {
      const Comments = await commentSchema.getCommentsWithUserDetails();
      res.send(Comments);
    } catch (err) {
      next(err);
    }
  }
);

commentRouter.get(
  "/posts/:postId/comments/:commentId",
  isPostExisted,
  async (req, res, next) => {
    try {
      const Comment = await commentSchema.findById(req.params.commentId);
      if (Comment) {
        res.send(Comment);
      } else {
        next(
          createHttpError(
            404,
            `Comment with the id of ${req.params.commentId} not found`
          )
        );
      }
    } catch (err) {
      next(err);
    }
  }
);

commentRouter.put(
  "/posts/:postId/comments/:commentId",
  isPostExisted,
  async (req, res, next) => {
    try {
      const UpdatedComment = await commentSchema.findByIdAndUpdate(
        req.params.commentId,
        req.body,
        { new: true, runValidators: true }
      );
      if (UpdatedComment) {
        res.send(UpdatedComment);
      } else {
        next(
          createHttpError(
            404,
            `Comment with the id of ${req.params.commentId} not found`
          )
        );
      }
    } catch (err) {
      next(err);
    }
  }
);

commentRouter.delete(
  "/posts/:postId/comments/:commentId",
  isPostExisted,
  async (req, res, next) => {
    try {
      const Deleted = await commentSchema.findByIdAndDelete(
        req.params.commentId
      );

      if (Deleted) {
        const updatedPost = await postModel.findByIdAndUpdate(
          req.params.commentId,
          { $pull: { comments: req.params.commentId } },
          { new: true, runValidators: true }
        );
        res.status(204).send();
      } else {
        next(
          createHttpError(
            404,
            `Comment with the id of ${req.params.commentId} not found`
          )
        );
      }
    } catch (err) {
      next(err);
    }
  }
);

export default commentRouter;
