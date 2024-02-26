//이파일은 express 된 것들과 server의 configuration에 관련된 코드만 관리
import express from "express";
import morgan from "morgan";
import session from "express-session";
import MongoStore from "connect-mongo";
import rootRouter from "./routers/rootRouter";
import userRouter from "./routers/userRouter";
import videoRouter from "./routers/videoRouter";
import { localsMiddleware } from "./middlewares";
import { connection } from "mongoose";



const app= express();
const logger= morgan("dev");


app.set("view engine","pug");
app.set("views", process.cwd()+"/src/views");
app.use(logger);
//req.body 없음
//unlencoded 이녀석이 html form형식을 이해하고 form을 우리가 사용할 수 있는 javascript objcet 형식으로 통역해준다.
app.use(express.urlencoded({extended: true}));
//router전에 사용해야함.
//session 미들웨어가 사이트로 들어오는 모두를 기억
//session이 있으면 express가 알아서 그 브라우저를 위한 id를 만들고 브라우저에게 보내줌
//브라우저가 쿠키에 그 세션 id를 저장하고 express에서도 그 세션을 DB에 저장함
//쿠키에 저장한 세션 id를 브라우저가 localhost:4000의 모든 url 에 요청을 보낼 때마다 세션id를 요청과 함께 보냄
//백엔드에서 어떤 유저가 어떤 브라우저에서 요청을 보냈는 지 알 수 있음
app.use(session({
	//secret은 우리가 쿠키에 sign 할 때 사용하는 string이다
	//쿠키에 sign하는 이유? 우리 backend가 쿠키를 줬다는 걸 보여주기 위해
	secret:process.env.COOKIE_SECRET,
	resave:true,
	//세션은 userController에서 수정
	//세션이 새로 만들어지고 수정된 적이 없을 때 uninitialized(초기화되지 않은)
	//세션을 수정할 때만 세션을 DB에 저장하고 쿠키를 넘겨준다
	saveUninitialized: false,
	// cookie:{
	// 	maxAge:10000,
	// },
	store: MongoStore.create({mongoUrl: process.env.DB_URL})
}))


app.use(localsMiddleware);
//static files (정적파일)serving활성화 =>브라우저에 폴더 전체를 노출시킴
//서버에 assets폴더의 내용물을 /static주소를 통해 공개하라고 요청
app.use("/static",express.static("assets"));
app.use("/uploads",express.static("uploads"));
//이후에 req.body가 존재
app.use("/", rootRouter);
app.use("/users", userRouter);
app.use("/videos",videoRouter);

export default app;
