import Express from "express";
import createHttpError from "http-errors";
import PostModel from "./model.js";
import UsersModel from "../users/model.js";
import q2m from "query-to-mongo";
const PostsRouter = Express.Router();

PostsRouter.post("/posts", async (req, res, next) => {
  try {
    const newPost = new PostModel(req.body);
    const { _id } = await newPost.save();
    if (newPost) {
      const updatedUser = await UsersModel.findByIdAndUpdate(
        newPost.user,
        { $push: { posts: _id } },
        { new: true, runValidators: true }
      );
      if (updatedUser) {
        res.send(updatedUser);
      }
    }
  } catch (err) {
    next(err);
  }
});

PostsRouter.get("/posts", async (req, res, next) => {
  try {
    const mongoQuery = q2m(req.query);
    const allPosts = await PostModel.find(
      mongoQuery.criteria,
      mongoQuery.options.fields
    )
      .limit(mongoQuery.options.limit)
      .skip(mongoQuery.options.skip)
      .sort(mongoQuery.options.sort)
      .populate({ path: "comments", select: "comment user" })
      .populate({ path: "user", select: " name surname  image  _id title" })
      .populate({
        path: "comments",
        populate: {
          path: "user",
          select: "name surname image",
        },
      });

    const total = await PostModel.countDocuments(mongoQuery.criteria);

    res.send({
      links: mongoQuery.links("http://localhost:3001/api/posts/", total),
      total,
      numberOfPages: Math.ceil(total / mongoQuery.options.limit),
      allPosts,
    });
  } catch (err) {
    next(err);
  }
});

PostsRouter.get("/posts/:postId", async (req, res, next) => {
  try {
    const Posts = await PostModel.findById(req.params.postId);
    if (Posts) {
      res.send(Posts);
    } else {
      next(
        createHttpError(404, `Post with id ${req.params.postId} not found!`)
      );
    }
  } catch (err) {
    next(err);
  }
});

PostsRouter.put("/posts/:postId", async (req, res, next) => {
  try {
    let updated = await PostModel.findByIdAndUpdate(
      req.params.postId,
      req.body,
      { new: true, runValidators: true }
    );
    if (updated) {
      res.send(updated);
    } else {
      next(
        createHttpError(404, `Post with id ${req.params.postId} not found!`)
      );
    }
  } catch (err) {
    next(err);
  }
});

PostsRouter.delete("/posts/:postId", async (req, res, next) => {
  try {
    const deleted = await PostModel.findByIdAndDelete(req.params.postId);
    if (deleted) {
      const user = await UsersModel.findByIdAndUpdate(
        req.params.userId,
        { $pull: { experiences: req.params.expId } },
        { new: true, runValidators: true }
      );
      res.status(204).send();
    }
  } catch (err) {
    next(err);
  }
});

// like dislike ✅ add liked post's id into user's liked posts property.
PostsRouter.put("/posts/:postId/LikeDislike", async (req, res, next) => {
  try {
    const post = await PostModel.findById(req.params.postId);
    const user = await UsersModel.findById(req.body.userId);
    if (post && user) {
      if (!post.likes.includes(req.body.userId.toString())) {
        const likedPost = await PostModel.findByIdAndUpdate(
          req.params.postId,
          { $push: { likes: req.body.userId } },
          { new: true, runValidators: true }
        );
        const whoLiked = await UsersModel.findByIdAndUpdate(
          req.body.userId,
          { $push: { likedPosts: req.params.postId } },
          { new: true, runValidators: true }
        );
        res.send({
          likesCount: likedPost.likes.length,
          likes: likedPost.likes,
          message: "Post liked!",
        });
      } else {
        const dislikedPost = await PostModel.findByIdAndUpdate(
          req.params.postId,
          { $pull: { likes: req.body.userId } },
          { new: true, runValidators: true }
        );
        const whoDisliked = await UsersModel.findByIdAndUpdate(
          req.body.userId,
          { $pull: { likedPosts: req.params.postId } },
          { new: true, runValidators: true }
        );
        res.send({
          likesCount: dislikedPost.likes.length,
          likes: dislikedPost.likes,
          message: "Post disliked!",
        });
      }
    } else {
      if (post)
        next(
          createHttpError(404, `Post with id ${req.params.postId} not found!`)
        );
      if (user)
        next(
          createHttpError(404, `Post with id ${req.body.userId} not found!`)
        );
    }
  } catch (error) {
    next(error);
  }
});

export default PostsRouter;
