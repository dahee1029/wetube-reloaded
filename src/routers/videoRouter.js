import express from "express";

import { watch, getUpload, postUpload,getEdit, postEdit , deleteVideo } from "../controllers/videoController";
import { protectorMiddleware, uploadFiles, videoUpload } from "../middlewares";
const videoRouter= express.Router();


videoRouter.route("/upload").all(protectorMiddleware).get(getUpload).post(videoUpload.single("video"),postUpload);
//regular expression 정규표현식  /:id(\\d+)
//[0-9a-f]{24}
//path variable
videoRouter.get("/:id", watch);
videoRouter.route("/:id([0-9a-f]{24})/edit").all(protectorMiddleware).get(getEdit).post(postEdit);
videoRouter.route("/:id([0-9a-f]{24})/delete").all(protectorMiddleware).get(deleteVideo);


export default videoRouter;