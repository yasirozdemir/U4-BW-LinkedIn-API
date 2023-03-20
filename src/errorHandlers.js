import mongoose from "mongoose";

export const badRequestHandler = (err, req, res, next) => {
  if (err.status === 400 || err instanceof mongoose.Error.ValidationError) {
    // if there is a validation error, it will throw a bad req error
    res.status(400).send({
      message: err.message,
    });
  } else if (err instanceof mongoose.Error.CastError) {
    // if there is a cast error related with id, it will throw a bad req error
    res.status(400).send({ message: "Invalid _id in request params!" });
  } else next(err);
};

export const unauthorizedHandler = (err, req, res, next) => {
  if (err.status === 401) {
    res.status(401).send({
      message: err.message,
    });
  } else next(err);
};

export const notFoundHandler = (err, req, res, next) => {
  if (err.status === 404) {
    res.status(404).send({
      message: err.message,
    });
  } else next(err);
};

export const genericErrorHandler = (err, req, res, next) => {
  console.log("ERROR: ", err.message);
  res.status(500).send({
    message: "A problem occured caused by the server!",
  });
};
