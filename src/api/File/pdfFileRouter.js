const pdfFileRouter = Express.Router();
import Express from "express";
import UsersModel from "../users/model.js";
import { pipeline } from "stream";

import { getPDFReadableStream } from "../lib/pdf-tools.js";
import createHttpError from "http-errors";

pdfFileRouter.get("/pdf/:userId", async (req, res, next) => {
  try {
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=${req.params.userId}.pdf`
    );
    const selectedUser = await UsersModel.findById(req.params.userId);
    const user = await UsersModel.findById(req.params.userId).populate({
      path: "experiences",
    });
    console.log("in pdf router", user.experiences);
    if (!user) {
      return next(
        createHttpError(404, `User with id ${req.params.articleId} not found!`)
      );
    }
    const source = await getPDFReadableStream(user);
    const destination = res;

    pipeline(source, destination, (err) => {
      if (err) console.log(err);
    });
  } catch (error) {
    next(error);
  }
});

export default pdfFileRouter;
