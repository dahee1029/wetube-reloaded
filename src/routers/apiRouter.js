//api는 백엔드가 템플릿을 렌더링 하지 않을 때 프로트와 백엔드가 통신하는 방법
import { registerView,createComment } from "../controllers/videoController";
import express from "express";

const apiRouter =  express.Router();

apiRouter.post("/videos/:id([0-9a-f]{24})/view",registerView);
apiRouter.post("/videos/:id([0-9a-f]{24})/comment",createComment);

export default apiRouter;
