import Express from "express";
import createHttpError from "http-errors";
import UsersModel from "./model.js";
import q2m from "query-to-mongo";
import mongoose, { model } from "mongoose";
const UsersRouter = Express.Router();

UsersRouter.post("/users", async (req, res, next) => {
  try {
    const Users = await UsersModel.find();
    const newUser = new UsersModel(req.body);
    const exists = Users.find((a) => a.email === newUser.email);
    if (exists) {
      res.send(
        createHttpError(400, `User with email ${newUser.email} already exists!`)
      );
    } else {
      const { _id } = await newUser.save();
      res.status(201).send({ _id: _id });
    }
  } catch (err) {
    next(err);
  }
});

UsersRouter.get("/users", async (req, res, next) => {
  try {
    // const Users=await UsersModel.find()
    // res.send(Users)
    const mongoQuery = q2m(req.query);
    const allUsers = await UsersModel.find(
      mongoQuery.criteria,
      mongoQuery.options.fields
    )
      .limit(mongoQuery.options.limit)
      .skip(mongoQuery.options.skip)
      .sort(mongoQuery.options.sort)
      .populate({ path: "posts", select: "text image " })
      .populate({ path: "friendRequests", select: "name email" });

    const total = await UsersModel.countDocuments(mongoQuery.criteria);
    res.send({
      links: mongoQuery.links(
        process.env.FE_PROD_URL || process.env.FE_DEV_URL + "/api/posts/",
        total
      ),
      numberOfPages: Math.ceil(total / mongoQuery.options.limit),
      allUsers,
    });
  } catch (err) {
    next(err);
  }
});

UsersRouter.get("/users/:userId", async (req, res, next) => {
  try {
    const User = await UsersModel.findById(req.params.userId);
    if (User) {
      res.send(User);
    } else {
      if (updated) {
        res.send(updated);
      } else {
        next(
          createHttpError(404, `User with id ${req.params.userId} not found!`)
        );
      }
    }
  } catch (err) {
    next(err);
  }
});

UsersRouter.put("/users/:userId", async (req, res, next) => {
  try {
    const updated = await UsersModel.findByIdAndUpdate(
      req.params.userId,
      req.body,
      { new: true, runValidators: true }
    );

    if (updated) {
      res.send(updated);
    } else {
      next(
        createHttpError(404, `User with id ${req.params.userId} not found!`)
      );
    }
  } catch (err) {
    next(err);
  }
});

UsersRouter.delete("/users/:userId", async (req, res, next) => {
  try {
    const deleted = await UsersModel.findByIdAndDelete(req.params.userId);
    if (deleted) {
      res.status(204).send();
    }
  } catch (err) {
    next(err);
  }
});
UsersRouter.put(
  "/users/:userId/friendRequest/:secondUserId",
  async (req, res, next) => {
    try {
      const newSender = await UsersModel.findById(req.params.userId);

      if (newSender) {
        if (!newSender.friends.includes(req.params.secondUserId)) {
          if (
            !newSender.sentRequests.includes(req.params.secondUserId.toString())
          ) {
            const sender = await UsersModel.findByIdAndUpdate(
              req.params.userId,
              { $push: { sentRequests: req.params.secondUserId } },
              { new: true, runValidators: true }
            );
            const reciever = await UsersModel.findByIdAndUpdate(
              req.params.secondUserId,
              { $push: { friendRequests: req.params.userId } },
              { new: true, runValidators: true }
            );
            res.send(`Friend Request sent`);
          } else {
            const sender = await UsersModel.findByIdAndUpdate(
              req.params.userId,
              { $pull: { sentRequests: req.params.secondUserId } },
              { new: true, runValidators: true }
            );
            const reciever = await UsersModel.findByIdAndUpdate(
              req.params.secondUserId,
              { $pull: { friendRequests: req.params.userId } },
              { new: true, runValidators: true }
            );
            res.send(`Friend Request unsent`);
          }
        } else {
          res.send("You are already friends with this user");
        }
      }
    } catch (err) {
      next(err);
    }
  }
);

UsersRouter.put(
  "/users/:userId/friendUnfriend/:secondUserId",
  async (req, res, next) => {
    try {
      const newFriend = await UsersModel.findById(req.params.userId);
      if (newFriend) {
        if (
          !newFriend.friendRequests.includes(req.params.secondUserId.toString())
        ) {
          if (!newFriend.friends.includes(req.params.secondUserId.toString())) {
            const reciever = await UsersModel.findByIdAndUpdate(
              req.params.userId,
              {
                $push: { friends: req.params.secondUserId },
                $pull: { friendRequests: req.params.secondUserId },
              },

              { new: true, runValidators: true }
            );
            const sender = await UsersModel.findByIdAndUpdate(
              req.params.secondUserId,
              {
                $push: { friends: req.params.userId },
                $pull: { sentRequests: req.params.userId },
              },

              { new: true, runValidators: true }
            );
            res.send("Friend request accepted");
          } else {
            const reciever = await UsersModel.findByIdAndUpdate(
              req.params.userId,
              { $pull: { friends: req.params.secondUserId } },

              { new: true, runValidators: true }
            );
            const sender = await UsersModel.findByIdAndUpdate(
              req.params.secondUserId,
              { $pull: { friends: req.params.userId } },

              { new: true, runValidators: true }
            );
            res.send("Unfriended");
          }
        } else {
          res.send("You need to send a friend request first");
        }
      }
    } catch (err) {
      next(err);
    }
  }
);

UsersRouter.put(
  "/users/:userId/decline/:secondUserId",
  async (req, res, next) => {
    try {
      const newFriend = await UsersModel.findById(req.params.userId);
      if (newFriend) {
        if (
          newFriend.friendRequests.includes(req.params.secondUserId.toString())
        ) {
          const reciever = await UsersModel.findByIdAndUpdate(
            req.params.userId,
            { $pull: { friendRequests: req.params.secondUserId } },
            { new: true, runValidators: true }
          );
          const sender = await UsersModel.findByIdAndUpdate(
            req.params.secondUserId,
            { $pull: { sentRequests: req.params.userId } },
            { new: true, runValidators: true }
          );
          res.send("Friend Request Declined");
        } else {
          res.send("There is no request to decline");
        }
      }
    } catch (err) {
      next(err);
    }
  }
);

export default UsersRouter;
