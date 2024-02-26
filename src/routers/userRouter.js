import express from "express";
import { edit, remove, logout, see ,startGithubLogin, finishGithubLogin,startKakaoLogin, finishKakaoLogin, getEdit, postEdit, getChangePassword, postChangePassword} from "../controllers/userController";
import { avatarUpload, protectorMiddleware, publicOnlyMiddleware, uploadFiles } from "../middlewares";
import { use } from "passport";
const userRouter= express.Router();


//all() : 어떤 http method를 사용하든지 모두에게 사용하겠다는 뜻
//multer uploadFiles.single은 template의 input에서 오는 avatar파일을 가지고 파일을 업로드하고 uploads파일에 저장
//후에 controller인 postEidt에 그 파일의 정보를 전달함

userRouter.route("/edit").all(protectorMiddleware).get(getEdit).post(avatarUpload.single("avatar"),postEdit);
userRouter.route("/change-password").all(protectorMiddleware).get(getChangePassword).post(postChangePassword);
userRouter.get("/delete", remove);
userRouter.get("/logout",protectorMiddleware,logout);
userRouter.get("/github/start",publicOnlyMiddleware,startGithubLogin);
userRouter.get("/github/callback",publicOnlyMiddleware,finishGithubLogin);
userRouter.get("/kakao/start",publicOnlyMiddleware,startKakaoLogin);
userRouter.get("/kakao/callback",publicOnlyMiddleware,finishKakaoLogin);

userRouter.get("/:id", see);


export default userRouter;